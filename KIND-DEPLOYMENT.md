# 🚀 Kind Deployment Guide for DevOps Todo App

This guide demonstrates deploying a full-stack todo application using Kind (Kubernetes in Docker) as part of a complete DevOps pipeline with GitOps principles.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DevOps Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│ GitHub → Actions CI → Docker Hub → ArgoCD → Kind Cluster       │
└─────────────────────────────────────────────────────────────────┘

Local Development Environment:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   Kind Cluster   │    │   Docker Hub    │
│   Workstation   │───▶│   (Local K8s)    │◀───│   (Registry)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Required Tools
- **[Docker](https://docs.docker.com/get-docker/)** (v20.10+)
- **[Kind](https://kind.sigs.k8s.io/docs/user/quick-start/)** (v0.17+)
- **[kubectl](https://kubernetes.io/docs/tasks/tools/)** (v1.25+)
- **[Helm](https://helm.sh/docs/intro/install/)** (v3.10+)
- **[ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/)** (optional)

### Verification Commands
```bash
# Verify installations
docker --version
kind --version
kubectl version --client
helm version
```

## 🚀 Quick Deployment Options

### Option 1: Using Deployment Script (Recommended)

```bash
# Make script executable and run
chmod +x scripts/deploy-kind.sh
./scripts/deploy-kind.sh
```

### Option 2: Manual Step-by-Step Deployment

Follow the detailed steps below for complete understanding.

## 🔧 Step-by-Step Manual Deployment

### 1. Create Kind Cluster with Custom Configuration

```bash
# Create cluster with custom configuration
kind create cluster --config=kind-cluster-config.yaml --name fullstack-todo-cluster

# Verify cluster creation
kubectl cluster-info --context kind-fullstack-todo-cluster
```

**Cluster Configuration Features:**
- 1 Control Plane Node
- 2 Worker Nodes (for High Availability)
- Port Mappings: 80, 443, 3000
- Ingress-ready configuration

### 2. Install NGINX Ingress Controller

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 3. Set Up Persistent Storage

```bash
# Create PersistentVolume for data persistence
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: todo-app-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /tmp/todo-app-data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: todo-app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: standard
EOF
```

### 4. Deploy Application

#### Option A: Using Helm Charts (GitOps Ready)

```bash
# Install using Helm
helm install todo-app ./helm/fullstack-todo-app-charts

# Verify deployment
helm status todo-app
```

#### Option B: Using Raw Kubernetes Manifests

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s-manifest.yaml

# Wait for deployment to be ready
kubectl wait --for=condition=available --timeout=300s deployment/fullstack-todo-app
```

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all

# Check specific resources
kubectl get pods -l app=fullstack-todo-app
kubectl get svc fullstack-todo-service
kubectl get ingress fullstack-todo-ingress
kubectl get pvc todo-app-pvc
```

## 🌐 Accessing the Application

### Method 1: Using Ingress (Production-like)

1. **Configure local DNS**:
   
   **Linux/Mac/WSL:**
   ```bash
   echo "127.0.0.1 todo-app.local" | sudo tee -a /etc/hosts
   ```
   
   **Windows PowerShell (Run as Administrator):**
   ```powershell
   Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1 todo-app.local"
   ```

2. **Enable port forwarding for ingress**:
   ```bash
   kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 &
   ```

3. **Access the application**: 
   - Browser: http://todo-app.local
   - API: http://todo-app.local/api/todos

### Method 2: Direct Service Access

```bash
# Port forward to service
kubectl port-forward service/fullstack-todo-service 3000:3000

# Access at: http://localhost:3000
```

### Method 3: NodePort Access (Alternative)

```bash
# Get NodePort
kubectl get svc fullstack-todo-service

# Access via NodePort (usually 30000-32767 range)
curl http://localhost:<nodeport>
```

## 🔄 GitOps Integration with ArgoCD

### 1. Install ArgoCD

```bash
# Create namespace and install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### 2. Access ArgoCD UI

```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access ArgoCD at: https://localhost:8080
# Username: admin
# Password: (from above command)
```

### 3. Create Application in ArgoCD

```bash
# Create ArgoCD application
kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: todo-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/vanshitsharma18/todo-app-deployment
    path: helm/fullstack-todo-app-charts
    targetRevision: master
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
```

## 🔍 Monitoring and Observability

### Resource Monitoring

```bash
# Check resource usage
kubectl top nodes
kubectl top pods

# Watch pod status in real-time
kubectl get pods -w

# Check deployment status
kubectl rollout status deployment/fullstack-todo-app
```

### Application Health Checks

```bash
# Check application health
kubectl get pods -l app=fullstack-todo-app
kubectl describe pod -l app=fullstack-todo-app

# Check service endpoints
kubectl get endpoints fullstack-todo-service

# Test application endpoints
curl -H "Host: todo-app.local" http://localhost/api/todos
```

### Logging

```bash
# View application logs
kubectl logs -l app=fullstack-todo-app -f

# View logs from all containers
kubectl logs -l app=fullstack-todo-app --all-containers=true

# View previous container logs (if pod restarted)
kubectl logs -l app=fullstack-todo-app --previous
```

## 🎯 DevOps Operations

### Scaling Operations

```bash
# Horizontal scaling
kubectl scale deployment fullstack-todo-app --replicas=3

# Verify scaling
kubectl get pods -l app=fullstack-todo-app

# Auto-scaling (HPA)
kubectl autoscale deployment fullstack-todo-app --cpu-percent=50 --min=1 --max=10

# Check HPA status
kubectl get hpa
```

### Update Strategies

#### Rolling Updates
```bash
# Update image tag
kubectl set image deployment/fullstack-todo-app fullstack-todo-app=vanshitsharma07/fullstack-todo-app:new-tag

# Monitor rollout
kubectl rollout status deployment/fullstack-todo-app

# Rollback if needed
kubectl rollout undo deployment/fullstack-todo-app
```

#### Blue-Green Deployment with Helm
```bash
# Deploy new version
helm upgrade todo-app ./helm/fullstack-todo-app-charts --set image.tag=new-version

# Rollback if issues
helm rollback todo-app 1
```

### Configuration Management

```bash
# Create ConfigMap for application config
kubectl create configmap app-config --from-literal=NODE_ENV=production

# Create Secret for sensitive data
kubectl create secret generic app-secrets --from-literal=DB_PASSWORD=secretpassword

# Apply configuration
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
EOF
```

## 🔧 Development Workflow

### Local Development Loop

1. **Make code changes**
2. **Build and test locally**:
   ```bash
   npm run dev
   ```

3. **Build Docker image**:
   ```bash
   docker build -t fullstack-todo-app:dev .
   ```

4. **Load image into Kind**:
   ```bash
   kind load docker-image fullstack-todo-app:dev --name fullstack-todo-cluster
   ```

5. **Update deployment**:
   ```bash
   kubectl set image deployment/fullstack-todo-app fullstack-todo-app=fullstack-todo-app:dev
   ```

6. **Test changes**:
   ```bash
   curl -H "Host: todo-app.local" http://localhost/api/todos
   ```

### CI/CD Integration Testing

```bash
# Simulate CI/CD pipeline locally
# 1. Build image with build ID
docker build -t vanshitsharma07/fullstack-todo-app:$(date +%s) .

# 2. Push to registry (if testing with DockerHub)
docker push vanshitsharma07/fullstack-todo-app:$(date +%s)

# 3. Update Helm values
sed -i 's/tag: .*/tag: "'$(date +%s)'"/' helm/fullstack-todo-app-charts/values.yaml

# 4. Upgrade with Helm
helm upgrade todo-app ./helm/fullstack-todo-app-charts
```

## 🛠️ Troubleshooting Guide

### Common Issues and Solutions

#### 1. Cluster Connection Issues
```bash
# Check if Kind cluster is running
kind get clusters

# If no clusters, create one
kind create cluster --config=kind-cluster-config.yaml --name fullstack-todo-cluster

# Set correct context
kubectl config use-context kind-fullstack-todo-cluster

# Verify connection
kubectl cluster-info
```

#### 2. Ingress Controller Issues
```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Reinstall if needed
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

#### 3. Image Pull Issues
```bash
# Check if image exists locally
docker images | grep fullstack-todo-app

# Load image into Kind
kind load docker-image vanshitsharma07/fullstack-todo-app:latest --name fullstack-todo-cluster

# Verify image in cluster
docker exec -it fullstack-todo-cluster-control-plane crictl images | grep fullstack-todo-app
```

#### 4. Pod Startup Issues
```bash
# Check pod events
kubectl describe pod -l app=fullstack-todo-app

# Check resource constraints
kubectl top pods
kubectl describe nodes

# Check logs for errors
kubectl logs -l app=fullstack-todo-app --tail=50
```

#### 5. Service Discovery Issues
```bash
# Check service endpoints
kubectl get endpoints fullstack-todo-service

# Test service connectivity
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -qO- http://fullstack-todo-service:3000/api/todos

# Check DNS resolution
kubectl run test-pod --image=busybox --rm -it --restart=Never -- nslookup fullstack-todo-service
```

#### 6. Persistent Volume Issues
```bash
# Check PV and PVC status
kubectl get pv,pvc
kubectl describe pvc todo-app-pvc

# Check storage class
kubectl get storageclass

# Manually create PV if needed
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: todo-app-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /tmp/todo-app-data
EOF
```

#### 7. Network Access Issues
```bash
# For WSL users - ensure port forwarding is active
kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 &

# Test with curl first
curl -H "Host: todo-app.local" http://localhost

# Check hosts file
grep todo-app.local /etc/hosts

# Alternative port to avoid conflicts
kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80 &
```

## 🧪 Testing and Validation

### Health Check Tests
```bash
# Test liveness probe
kubectl exec -it $(kubectl get pods -l app=fullstack-todo-app -o jsonpath='{.items[0].metadata.name}') -- curl http://localhost:3000/api/todos

# Test readiness probe
kubectl get pods -l app=fullstack-todo-app -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}'

# Load testing (if needed)
kubectl run load-test --image=busybox --rm -it --restart=Never -- /bin/sh -c "while true; do wget -qO- http://fullstack-todo-service:3000/api/todos; sleep 1; done"
```

### Integration Tests
```bash
# Test full application flow
curl -X POST -H "Content-Type: application/json" -H "Host: todo-app.local" \
  -d '{"title":"Test Todo","completed":false}' \
  http://localhost/api/todos

curl -H "Host: todo-app.local" http://localhost/api/todos
```

## 🧹 Cleanup Operations

### Remove Application Only
```bash
# Using Helm
helm uninstall todo-app

# Using kubectl
kubectl delete -f k8s-manifest.yaml
```

### Remove ArgoCD
```bash
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete namespace argocd
```

### Complete Cleanup
```bash
# Delete entire cluster
kind delete cluster --name fullstack-todo-cluster

# Clean up hosts file
sudo sed -i '/todo-app.local/d' /etc/hosts

# Clean up Docker images (optional)
docker rmi $(docker images | grep fullstack-todo-app | awk '{print $3}')
```

## 📊 Performance Optimization

### Resource Optimization
```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Optimize resource requests/limits
kubectl patch deployment fullstack-todo-app -p '{"spec":{"template":{"spec":{"containers":[{"name":"fullstack-todo-app","resources":{"requests":{"memory":"64Mi","cpu":"50m"},"limits":{"memory":"128Mi","cpu":"100m"}}}]}}}}'
```

### Storage Optimization
```bash
# Check storage usage
kubectl exec -it $(kubectl get pods -l app=fullstack-todo-app -o jsonpath='{.items[0].metadata.name}') -- df -h

# Cleanup logs if needed
kubectl exec -it $(kubectl get pods -l app=fullstack-todo-app -o jsonpath='{.items[0].metadata.name}') -- find /var/log -type f -name "*.log" -delete
```

## 🔐 Security Best Practices

### Network Policies
```bash
# Create network policy for pod isolation
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: todo-app-network-policy
spec:
  podSelector:
    matchLabels:
      app: fullstack-todo-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - {}
EOF
```

### Security Context
```bash
# Apply security context
kubectl patch deployment fullstack-todo-app -p '{"spec":{"template":{"spec":{"securityContext":{"runAsNonRoot":true,"runAsUser":1000,"fsGroup":2000}}}}}'
```

## 📈 Advanced Features

### Horizontal Pod Autoscaler
```bash
# Enable metrics server (for Kind)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server for Kind
kubectl patch deployment metrics-server -n kube-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"metrics-server","args":["--cert-dir=/tmp","--secure-port=4443","--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname","--kubelet-use-node-status-port","--metric-resolution=15s","--kubelet-insecure-tls"]}]}}}}'

# Create HPA
kubectl autoscale deployment fullstack-todo-app --cpu-percent=50 --min=1 --max=10
```

### Custom Metrics
```bash
# Create custom metrics (example)
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: custom-metrics-apiserver
  namespace: custom-metrics
spec:
  ports:
  - port: 443
    targetPort: 6443
  selector:
    app: custom-metrics-apiserver
EOF
```

---

## 🎯 Next Steps

1. **Explore ArgoCD GitOps**: Set up automatic deployments
2. **Add Monitoring**: Implement Prometheus and Grafana
3. **Implement Service Mesh**: Add Istio for advanced networking
4. **Add CI/CD**: Integrate with GitHub Actions
5. **Production Deployment**: Move to cloud providers (EKS, GKE, AKS)

---

💡 **Pro Tip**: This Kind deployment serves as a perfect local development environment that mirrors your production Kubernetes setup!

🔗 **Related Documentation**:
- [Kind Documentation](https://kind.sigs.k8s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Helm Documentation](https://helm.sh/docs/)

⭐ **Star the repository if this guide helped you learn Kubernetes and DevOps!**
