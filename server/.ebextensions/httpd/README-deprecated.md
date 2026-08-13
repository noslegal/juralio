This is deprecated - please use .platform!

#HTTP > HTTPS redirection

This folder and its contents are used to automatically redirect HTTP traffic to HTTPS. This was advised
by AWS documentation in the following locations. It also includes handling for HTTP health endpoint.

- https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https-httpredirect.html and
- https://github.com/awsdocs/elastic-beanstalk-samples/tree/master/configuration-files/aws-provided/security-configuration/https-redirect/java-tomcat

> NOTE: it may be required at some point to update this if the version of the Apache Proxy is updated.
