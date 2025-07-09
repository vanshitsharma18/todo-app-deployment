#!/bin/bash

# Kind Deployment Script for Full Stack Todo App

echo "🚀 Starting Kind deployment..."

# Check if Kind cluster exists
if ! kind get clusters | grep -q "fullstack-todo-cluster"; then
    echo "📦 Creating Kind cluster..."
    kind create cluster --config=kind-cluster-config.yaml
else
    echo "✅ Kind cluster already exists"
fi

# Install NGINX Ingress Controller
echo "🌐 Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for NGINX Ingress to be ready
echo "⏳ Waiting for NGINX Ingress Controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Build and load Docker image into Kind
echo "🐳 Building and loading Docker image into Kind..."
docker build -t fullstack-todo-app:latest .
kind load docker-image fullstack-todo-app:latest --name fullstack-todo-cluster

# Apply Kubernetes manifests
echo "⚙️  Deploying to Kubernetes..."
kubectl apply -f k8s-manifest.yaml

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/fullstack-todo-app

# Display access information
echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Access Information:"
echo "   • Add this to your /etc/hosts file (or C:\Windows\System32\drivers\etc\hosts on Windows):"
echo "     127.0.0.1 todo-app.local"
echo ""
echo "   • Then access the app at: http://todo-app.local"
echo ""
echo "🔍 Useful commands:"
echo "   • Check pods: kubectl get pods"
echo "   • Check services: kubectl get services"
echo "   • Check ingress: kubectl get ingress"
echo "   • View logs: kubectl logs -l app=fullstack-todo-app"
echo "   • Delete deployment: kubectl delete -f k8s-manifest.yaml"
echo "   • Delete cluster: kind delete cluster --name fullstack-todo-cluster"
echo ""
echo "🎯 Quick access via port-forward (alternative):"
echo "   kubectl port-forward service/fullstack-todo-service 3000:3000"
echo "   Then access at: http://localhost:3000"
echo ""
echo "🌐 Direct access via Kind port mapping:"
echo "   kubectl port-forward service/ingress-nginx-controller -n ingress-nginx 3000:80"
echo "   Then access at: http://localhost:3000 (with Host: todo-app.local header)"
