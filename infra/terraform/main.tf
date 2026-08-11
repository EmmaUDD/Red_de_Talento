terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  subnet_id = data.aws_subnets.default.ids[0]
}

resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "SG para el servidor de aplicacion (Django + Nginx)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH desde el admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-app-sg" }
}

resource "aws_security_group" "mongo" {
  name        = "${var.project_name}-mongo-sg"
  description = "SG para el replica set de MongoDB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH desde el admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "Mongo entre nodos del replica set"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description     = "Mongo desde el servidor de la app"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-mongo-sg" }
}

# --- Instancias EC2 ---------------------------------------------------------

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = local.subnet_id
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.app.id]

  tags = {
    Name = "${var.project_name}-app"
    Role = "app"
  }
}

# Nodos de MongoDB. El índice 0 se usa como primary inicial al armar el
# replica set en Ansible; los otros dos parten como secondary.
resource "aws_instance" "mongo" {
  count                  = var.mongo_node_count
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = local.subnet_id
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.mongo.id]

  tags = {
    Name = "${var.project_name}-mongo-${count.index + 1}"
    Role = "mongo"
  }
}

# --- Inventario de Ansible ---------------------------------------------
# Genera infra/ansible/inventory.ini con las IPs reales apenas se crean las
# instancias, para no copiarlas a mano y evitar errores de tipeo.
resource "local_file" "ansible_inventory" {
  content  = <<-EOT
    [app]
    app-server ansible_host=${aws_instance.app.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.private_key_path}

    [mongo]
    %{for i, ip in aws_instance.mongo[*].public_ip~}
    mongo-${i + 1} ansible_host=${ip} ansible_user=ubuntu ansible_ssh_private_key_file=${var.private_key_path} mongo_private_ip=${aws_instance.mongo[i].private_ip} replica_index=${i}
    %{endfor~}

    [mongo:vars]
    ansible_ssh_common_args='-o StrictHostKeyChecking=no'

    [app:vars]
    ansible_ssh_common_args='-o StrictHostKeyChecking=no'
  EOT
  filename = "${path.module}/../ansible/inventory.ini"
}
