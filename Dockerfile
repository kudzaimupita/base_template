FROM ubuntu:latest

RUN apt update && apt install -y curl

RUN curl -fsSL https://ollama.ai/install.sh | sh

RUN ollama serve & \
    sleep 5 && \
    ollama pull deepseek-r1:1.5b

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]