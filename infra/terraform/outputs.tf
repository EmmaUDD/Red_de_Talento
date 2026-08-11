output "app_public_ip" {
  value = aws_instance.app.public_ip
}

output "mongo_public_ips" {
  value = aws_instance.mongo[*].public_ip
}

output "mongo_private_ips" {
  value = aws_instance.mongo[*].private_ip
}

output "ssh_private_key_path" {
  value = var.private_key_path
}

output "ssh_app" {
  value = "ssh -i ${var.private_key_path} ubuntu@${aws_instance.app.public_ip}"
}

output "ssh_mongo" {
  value = [for ip in aws_instance.mongo[*].public_ip : "ssh -i ${var.private_key_path} ubuntu@${ip}"]
}
