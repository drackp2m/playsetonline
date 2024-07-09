FROM node:22.4-alpine3.19 AS base

RUN apk add --no-cache build-base python3

ARG USER_GID
ARG USER_UID

RUN if [ -n "$USER_GID" ] && [ "$USER_GID" != "1000" ]; then \
			sed -i "s/node:x:1000:1000:/node:x:1000:$USER_GID:/" /etc/passwd; \
		fi && \
		if [ -n "$USER_UID" ] && [ "$USER_UID" != "1000" ]; then \
			sed -i "s/node:x:1000:/node:x:$USER_UID:/" /etc/passwd; \
		fi

WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app \
			&& chown -R node:node /home/node



FROM base AS deps

USER node

COPY package.json package-lock* ./

RUN npm ci



FROM deps AS dev-attached

USER root

RUN apk add --no-cache sudo git openssh-client gnupg vim

RUN addgroup node root \
			&& echo "%root ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers

USER node

RUN sudo apk add --no-cache zsh zsh-vcs alpine-zsh-config \
			zsh-theme-powerlevel10k zsh-syntax-highlighting

RUN git config --global --add safe.directory /usr/src/app

RUN mkdir /home/node/.gnupg \
			&& chmod 700 /home/node/.gnupg

CMD node --run start



FROM deps AS build-api

CMD node --run build:api



FROM build-api AS serve-api

CMD node --run serve:api
