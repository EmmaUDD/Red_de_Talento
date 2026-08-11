variable "aws_region" {
  description = "Región AWS donde se despliega todo"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Prefijo usado para nombrar todos los recursos"
  type        = string
  default     = "redtalento"
}

variable "instance_type" {
  description = "Tipo de instancia EC2 (t3.micro = free tier)"
  type        = string
  default     = "t3.micro"
}

variable "admin_cidr" {
  description = "Tu IP pública en formato CIDR (ej: 190.12.34.56/32), para restringir el acceso SSH solo a ti. Obtenla con: curl.exe ifconfig.me"
  type        = string
}

variable "key_pair_name" {
  description = "Nombre de una key pair ya existente en EC2 (creada desde la consola: EC2 > Key Pairs)"
  type        = string
}

variable "private_key_path" {
  description = "Ruta local al archivo .pem descargado al crear la key pair, usada para SSH y para el inventario de Ansible"
  type        = string
}

variable "mongo_node_count" {
  description = "Cantidad de nodos del replica set de MongoDB"
  type        = number
  default     = 3
}
