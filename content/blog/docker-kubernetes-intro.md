+++
title = "Docker and Kubernetes: A Love-Hate Story"
date = 2025-12-30
description = "Learning containers and orchestration without losing your sanity (probably impossible)"

[taxonomies]
tags = ["docker", "kubernetes", "devops", "containers", "tutorial"]
categories = ["DevOps"]
+++

So you want to learn about containers and orchestration? Buckle up, because you're about to enter a world where "it works on my machine" becomes both your mantra and your nightmare.

## Docker: The Gateway Drug

Docker sold us on a beautiful dream: package your app with all its dependencies, and it'll run anywhere™.

Spoiler: It mostly works, but you'll still spend hours debugging networking issues.

### Why Docker Though?

Real talk - containers changed the game:

**The Promise:**

- "Works on my machine" ✅ Actually works elsewhere too
- No more dependency hell
- Consistent environments from dev to prod
- Spin up services in seconds

**The Reality:**

- YAML hell instead of dependency hell
- "Why is this container using 4GB of RAM?"
- Port conflicts. So many port conflicts.
- Volume mounts that make no sense

But honestly? Still worth it.

## Your First Dockerfile (That Actually Works)

Let's build something real - a basic Node.js API:

```dockerfile
# Start with a specific version, not "latest"
# (future you will thank present you)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching magic)
COPY package*.json ./

# Install dependencies
# --only=production because we're not savages
RUN npm ci --only=production

# Now copy the actual app
COPY . .

# Expose the port (more for documentation than function)
EXPOSE 3000

# Set environment variable defaults
ENV NODE_ENV=production

# Run the thing
CMD ["node", "server.js"]
```

Build it:

```bash
docker build -t my-app:1.0 .

# Tag it properly, not like an animal
docker tag my-app:1.0 myregistry/my-app:1.0
```

Run it:

```bash
docker run -d \
  -p 3000:3000 \
  --name my-app \
  --restart unless-stopped \
  my-app:1.0
```

### Docker Tips That'll Save Your Life

**1. Use `.dockerignore`**

```
node_modules/
.git/
*.log
.env
```

Your images will be 10x smaller. You're welcome.

**2. Multi-stage builds for compiled languages:**

```dockerfile
# Build stage
FROM golang:1.21 as builder
WORKDIR /app
COPY . .
RUN go build -o main .

# Runtime stage
FROM alpine:latest
COPY --from=builder /app/main /main
CMD ["/main"]
```

Went from 800MB to 20MB. Feel that dopamine hit.

**3. Actually use health checks:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Docker Compose: When You Need More Than One Container

Real apps need databases, caches, queues... Docker Compose orchestrates multiple containers so you don't have to run 47 terminal commands.

```yaml
version: "3.8"

services:
  # The actual app
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    restart: unless-stopped

  # PostgreSQL
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis for caching/sessions
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Run everything:

```bash
docker-compose up -d

# View logs
docker-compose logs -f app

# Tear it all down
docker-compose down -v  # -v removes volumes too
```

## Kubernetes: Because Apparently Docker Wasn't Complicated Enough

K8s (because typing "Kubernetes" is apparently too hard) is what you use when Docker Compose can't scale to your needs. Or when you want to put "Kubernetes" on your resume.

### What Even Is Kubernetes?

It's a container orchestrator. Fancy words for: "Deploy your Docker containers across many machines and K8s handles the chaos."

**K8s manages:**

- Scaling (add more containers automatically)
- Self-healing (container crashed? Restart it)
- Load balancing (distribute traffic)
- Rolling updates (deploy without downtime)
- Service discovery (containers finding each other)

**You manage:**

- Your sanity (good luck)
- Infinite YAML files
- A growing hatred of networking
- Your kubectl muscle memory

### Baby's First K8s Deployment

Here's the smallest useful K8s setup:

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3 # Run 3 copies of the app
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
          image: myregistry/my-app:1.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
```

**service.yaml:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer # Or ClusterIP, NodePort, etc.
```

Apply it:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check if it worked (narrator: it probably didn't)
kubectl get pods
kubectl get services
kubectl logs -f <pod-name>  # When things inevitably break
```

## The Learning Curve

**Week 1:** "This is easy!"  
**Week 2:** "Why isn't this working?"  
**Week 3:** _Googling frantically at 2 AM_  
**Week 4:** "Oh, that's actually clever"  
**Week 5:** Back to Week 2

## Resources That Helped Me Not Quit

- [Docker Docs](https://docs.docker.com/) - Actually pretty good
- [Kubernetes Docs](https://kubernetes.io/docs/) - Overwhelming but comprehensive
- [DevOps Twitter](https://twitter.com/) - Memes and troubleshooting
- Random YouTube tutorials at 3 AM
- Stack Overflow (obviously)

## Final Thoughts

Docker is genuinely useful and you should learn it. Kubernetes... depends on your scale. If you're running a personal blog, you don't need K8s (looking at you, overengineers).

But if you're deploying microservices that need to scale, or you're interviewing for jobs that require it, dive in. Just know it'll be frustrating before it clicks.

And remember: everyone Googles kubectl commands. Nobody remembers them all.

\- Dhanur
