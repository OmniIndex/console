# OmniIndex Platform, Management Console Web App
The project consists of\
*  .html files
*  .css Stylesheet files
*  .js Javascript files
*  .png image files
All files are held in the following folder structure\
- /
- styles/
- images/
- scripts/
\
With the top level folder (/) holding the index.html file\
The styles folder holding all of the css files\
The images folder holding the png files\
And the scripts folder holding the javascript.\
\
Building\
Clone this repo to your local system\
    git clone https://github.com/OmniIndex/console \
then\
$cd console \
$docker build . -t oidxconsole:v1 \
$docker run -dit oidxconsole:v1 \
\
Alternatively you can run this application within your own Google Cloud Project \
Visit the [Google Cloud Marketplace](https://cloud.google.com/marketplace) and search for OmniIndex \
If your OmniIndex Platform Instance is available on a public IP address or running on the OmniIndex Cloud \
you can also use the OmniIndex SaaS console located at \
[OmniIndex Management Console](https://saas.omnianalytics.live)
Or with docker \
- docker pull gcr.io/omniindex-oidx-dev/github.com/omniindex/console:6792ae5