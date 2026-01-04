+++
title = "Getting Started with Docker and Kubernetes"
date = 2026-01-02
description = "Learn the fundamentals of containerization with Docker and orchestration with Kubernetes"

[taxonomies]
tags = ["docker", "kubernetes", "devops", "containers", "tutorial"]
categories = ["DevOps"]

[extra.comments]
enabled = true
+++

# Getting Started with Docker and Kubernetes

Containerization has revolutionized how we deploy and manage applications. In this guide, I'll introduce you to Docker and Kubernetes, the cornerstones of modern DevOps.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies, ensuring consistency across environments.

### Why Use Docker?

- **Consistency**: "It works on my machine" becomes a thing of the past
- **Isolation**: Applications run in their own environments
- **Portability**: Run anywhere Docker is installed
- **Efficiency**: Lighter than virtual machines

## Your First Dockerfile

Here's a simple Dockerfile for a Node.js application:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run it:

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## Docker Compose for Multi-Container Apps

When your app needs multiple services (app, database, cache), use Docker Compose:

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://postgres:password@postgres:5432/mydb
      REDIS_URL: redis://redis:6379

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

## Introduction to Kubernetes

Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

### Key Concepts

- **Pod**: Smallest deployable unit (one or more containers)
- **Deployment**: Manages replica sets and updates
- **Service**: Exposes pods to network traffic
- **ConfigMap**: Configuration data for pods
- **Secret**: Sensitive data (passwords, tokens)

### Basic Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Docker vs Kubernetes

| Feature        | Docker           | Kubernetes          |
| -------------- | ---------------- | ------------------- |
| Purpose        | Containerization | Orchestration       |
| Scale          | Single host      | Multi-host clusters |
| Auto-scaling   | Manual           | Built-in            |
| Self-healing   | No               | Yes                 |
| Load balancing | Basic            | Advanced            |

## Best Practices

1. **Keep images small** - Use Alpine-based images
2. **Use multi-stage builds** - Reduce final image size
3. **Don't run as root** - Security best practice
4. **Implement health checks** - For reliable deployments
5. **Use resource limits** - Prevent resource starvation

## Getting Started

### Local Development

- **Docker Desktop**: For Mac and Windows
- **Minikube**: Local Kubernetes cluster
- **Kind**: Kubernetes in Docker

### Cloud Providers

- **AWS EKS**: Elastic Kubernetes Service
- **Google GKE**: Google Kubernetes Engine
- **Azure AKS**: Azure Kubernetes Service

## Conclusion

Docker and Kubernetes are essential tools in modern software development. Start with Docker for containerization, then graduate to Kubernetes when you need orchestration at scale.

Want to dive deeper? Check out my other posts on advanced Kubernetes patterns and CI/CD with Docker!

**Tags**: #Docker #Kubernetes #DevOps #Containers
