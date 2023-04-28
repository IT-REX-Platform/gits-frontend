FROM ubuntu:jammy

# install curl
RUN apt-get update -y
RUN apt-get install -y curl

# install node
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && apt-get install -y nodejs
RUN npm install -g pnpm

# install git 
RUN apt-get install -y git

# install watchman for relay / maintenance tool to work
RUN curl https://github.com/facebook/watchman/releases/download/v2023.04.03.00/watchman_ubuntu22.04_v2023.04.03.00.deb -o watchman.deb -L && apt-get install -y ./watchman.deb && rm watchman.deb

# install fish shell
RUN apt-get install -y fish
RUN echo /usr/bin/fish | tee -a /etc/shells
RUN chsh -s /usr/bin/fish
