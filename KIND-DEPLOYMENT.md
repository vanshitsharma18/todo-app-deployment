# Kind Deployment Guide for Full Stack Todo App

## Prerequisites

1. **Install Kind**: Follow the [official installation guide](https://kind.sigs.k8s.io/docs/user/quick-start/)
2. **Install kubectl**: Follow the [kubectl installation guide](https://kubernetes.io/docs/tasks/tools/)
3. **Docker**: Make sure Docker is installed and running

## Quick Deployment

### Option 1: Using the deployment script (Linux/Mac/WSL)

```bash
chmod +x deploy-kind.sh
./deploy-kind.sh
```

### Option 2: Manual deployment

1. **Create Kind cluster**:
   ```bash
   kind create cluster --config=kind-cluster-config.yaml
   ```

2. **Install NGINX Ingress Controller**:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
   ```

3. **Wait for Ingress Controller**:
   ```bash
   kubectl wait --namespace ingress-nginx \
     --for=condition=ready pod \
     --selector=app.kubernetes.io/component=controller \
     --timeout=90s
   ```

4. **Build and load Docker image**:
   ```bash
   docker build -t fullstack-todo-app:latest .
   kind load docker-image fullstack-todo-app:latest --name fullstack-todo-cluster
   ```

5. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s-manifest.yaml
   ```

6. **Wait for deployment**:
   ```bash
   kubectl wait --for=condition=available --timeout=300s deployment/fullstack-todo-app
   ```

## Accessing the Application

### Method 1: Using Ingress (Recommended)

1. **Add to hosts file**:
   
   **Linux/Mac/WSL**:
   ```bash
   echo "127.0.0.1 todo-app.local" | sudo tee -a /etc/hosts
   ```
   
   **Windows PowerShell** (Run as Administrator):
   ```powershell
   Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1 todo-app.local"
   ```
   
   **Windows Command Prompt** (Run as Administrator):
   ```cmd
   echo 127.0.0.1 todo-app.local >> C:\Windows\System32\drivers\etc\hosts
   ```
   
   **Quick verification**:
   ```bash
   # Linux/Mac/WSL
   grep todo-app.local /etc/hosts
   
   # Windows
   findstr todo-app.local C:\Windows\System32\drivers\etc\hosts
   ```

2. **Enable port forwarding for ingress access**:
   ```bash
   # Forward ingress controller to port 80 (required for Kind)
   kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 &
   ```

3. **Access the app**: http://todo-app.local


### Method 2: Port Forwarding to Service

```bash
kubectl port-forward service/fullstack-todo-service 3000:3000
```

Then access at: http://localhost:3000

### Method 4: Port Forwarding to Ingress

```bash
kubectl port-forward service/ingress-nginx-controller -n ingress-nginx 8080:80
```

Then access at: http://localhost:8080 (make sure to add `Host: todo-app.local` header or use curl):

```bash
curl -H "Host: todo-app.local" http://localhost:8080
```

## Cluster Configuration

The Kind cluster is configured with:

- **1 Control Plane Node**: Manages the cluster
- **2 Worker Nodes**: Run your application pods
- **Port Mappings**: 
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 3000 (Direct app access)
- **Ingress Ready**: Pre-configured for NGINX Ingress

## Monitoring and Management

### Check cluster status:
```bash
kind get clusters
kubectl cluster-info --context kind-fullstack-todo-cluster
```

### View all resources:
```bash
kubectl get all
```

### Check ingress:
```bash
kubectl get ingress
kubectl describe ingress fullstack-todo-ingress
```

### View logs:
```bash
kubectl logs -l app=fullstack-todo-app
```

### Scale the application:
```bash
kubectl scale deployment fullstack-todo-app --replicas=3
```

### Update the application:
```bash
# Rebuild and reload image
docker build -t fullstack-todo-app:latest .
kind load docker-image fullstack-todo-app:latest --name fullstack-todo-cluster

# Restart deployment
kubectl rollout restart deployment/fullstack-todo-app
```

## Cleanup

### Remove the application:
```bash
kubectl delete -f k8s-manifest.yaml
```

### Delete the entire cluster:
```bash
kind delete cluster --name fullstack-todo-cluster
```

## Troubleshooting

### Common Issues:

1. **kubectl connection refused (localhost:8080)**:
   ```bash
   # Check if Kind cluster is running
   kind get clusters
   
   # If no clusters exist, create one
   kind create cluster --config=kind-cluster-config.yaml
   
   # Check kubectl context
   kubectl config current-context
   
   # Set context to Kind cluster
   kubectl config use-context kind-fullstack-todo-cluster
   
   # Verify connection
   kubectl cluster-info
   ```

2. **Ingress webhook validation error**:
   ```bash
   # This happens when NGINX Ingress Controller is not fully ready
   # Wait for the ingress controller to be ready
   kubectl wait --namespace ingress-nginx \
     --for=condition=ready pod \
     --selector=app.kubernetes.io/component=controller \
     --timeout=300s
   
   # Check if admission webhook is running
   kubectl get pods -n ingress-nginx
   kubectl get validatingwebhookconfigurations
   
   # If still failing, apply without ingress first, then add ingress later
   kubectl apply -f k8s-manifest.yaml --validate=false
   ```

3. **Ingress not working**:
   ```bash
   # Check ingress controller status
   kubectl get pods -n ingress-nginx
   
   # Check ingress controller logs
   kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
   ```

4. **Image not found**:
   ```bash
   # Make sure image is loaded into Kind
   kind load docker-image fullstack-todo-app:latest --name fullstack-todo-cluster
   
   # Check if image is available
   docker exec -it fullstack-todo-cluster-control-plane crictl images
   ```

5. **Pods not starting**:
   ```bash
   # Check pod status and logs
   kubectl get pods
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

6. **Service not accessible**:
   ```bash
   # Check service endpoints
   kubectl get endpoints
   kubectl describe service fullstack-todo-service
   ```

7. **Persistent Volume issues**:
   ```bash
   # Check PV and PVC status
   kubectl get pv,pvc
   kubectl describe pvc todo-app-pvc
   ```

8. **Site can't be reached (todo-app.local)**:
   ```bash
   # For WSL users: Kind doesn't expose port 80 by default
   # REQUIRED: Port forward the ingress controller
   kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 &
   
   # Verify hosts file entry exists
   grep todo-app.local /etc/hosts
   
   # Test with curl first
   curl -H "Host: todo-app.local" http://localhost
   
   # For WSL users with Windows browser:
   # Add to Windows hosts file as well:
   # echo 127.0.0.1 todo-app.local >> C:\Windows\System32\drivers\etc\hosts
   
   # Alternative: Use different port to avoid conflicts
   kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80 &
   # Then access: http://localhost:8080 (modify hosts: 127.0.0.1:8080 todo-app.local)
   ```

## Architecture

```
Localhost (127.0.0.1)
       ↓
   Kind Cluster (Docker containers)
       ↓
   NGINX Ingress Controller
       ↓
   Service (ClusterIP)
       ↓
   Deployment (2 replicas across worker nodes)
       ↓
   Pods (fullstack-todo-app)
       ↓
   PersistentVolume (data storage)
```

## Development Workflow

1. **Make code changes**
2. **Rebuild image**: `docker build -t fullstack-todo-app:latest .`
3. **Load into Kind**: `kind load docker-image fullstack-todo-app:latest --name fullstack-todo-cluster`
4. **Restart deployment**: `kubectl rollout restart deployment/fullstack-todo-app`
5. **Test changes**: Access via http://todo-app.local
