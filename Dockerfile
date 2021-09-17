#get the latest Ubuntu release
FROM ubuntu:latest
MAINTAINER "sibain@omniindex.io OmniIndex Inc."
#Update the system, Make sure we are non interactive and then install apache2
RUN apt-get update  && export DEBIAN_FRONTEND=noninteractive \
&& apt-get -y install --no-install-recommends apt-utils \
        apache2
#We then copy the files from the web folder into /var/www/html where apache serves its pages from
COPY web/ /var/www/html/
#Now start apache making sure that it does not spawn off
CMD ["apachectl", "-D", "FOREGROUND"]
#Open port 80
EXPOSE 80