# Use NVIDIA base image with GPU support and CUDA 12.2.0
FROM nvidia/cuda:12.2.0-base-ubuntu20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive


RUN echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64 /" > /etc/apt/sources.list.d/cuda.list && \
    echo "deb http://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu2004/x86_64 /" > /etc/apt/sources.list.d/nvidia-ml.list

# Import the NVIDIA GPG key
RUN apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/7fa2af80.pub && \
    apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu2004/x86_64/7fa2af80.pub

# Update package lists
RUN apt-get update -y

# Install nvidia-container-toolkit
RUN apt-get install -y nvidia-container-toolkit

# Install Python and pip
RUN apt-get update -y && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install necessary ML libraries like TensorFlow
RUN pip3 install tensorflow

# Install Ubuntu functionalities
RUN apt-get update -y && \
    apt-get install -y sudo wget curl unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Docker
RUN apt-get update -y && \
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    apt-get update -y && \
    apt-get install -y docker-ce && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# Install OpenSSH Server
RUN apt-get update -y && \
    apt-get install -y openssh-server && \
    mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Expose SSH port
EXPOSE 22


# Start a shell by default
CMD dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 & /usr/sbin/sshd -D
