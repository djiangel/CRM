# pull official base image
FROM python:3.8.3-alpine
# set work directory
WORKDIR /usr/src/backend

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
#Installing dependencies, remove those that are not needed after the installation
RUN \
    apk add libpq libxml2-dev libxslt-dev g++ &&\
    apk add --no-cache --virtual .build-deps gcc postgresql-dev libc-dev make git libffi-dev openssl-dev python3-dev gcc musl-dev && \
    apk add jpeg-dev zlib-dev libjpeg &&\
    pip install -r requirements.txt &&\
    apk del .build-deps

# copy project
COPY . .
RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/
RUN ["chmod", "+x", "./entrypoint.sh"]

CMD [ "./entrypoint.sh" ]