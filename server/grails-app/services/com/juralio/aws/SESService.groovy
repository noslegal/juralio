/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.juralio.aws

import com.google.common.net.InternetDomainName
import com.juralio.config.ConfigService
import grails.gorm.transactions.Transactional
import org.springframework.beans.factory.annotation.Autowired
import software.amazon.awssdk.core.SdkBytes
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.ses.SesClient
import software.amazon.awssdk.services.ses.model.Body
import software.amazon.awssdk.services.ses.model.Content
import software.amazon.awssdk.services.ses.model.Destination
import software.amazon.awssdk.services.ses.model.Message
import software.amazon.awssdk.services.ses.model.RawMessage
import software.amazon.awssdk.services.ses.model.SendEmailRequest
import software.amazon.awssdk.services.ses.model.SendRawEmailRequest

import jakarta.activation.DataHandler
import jakarta.activation.DataSource
import jakarta.activation.FileDataSource
import jakarta.mail.Session
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeBodyPart
import jakarta.mail.internet.MimeMessage
import jakarta.mail.internet.MimeMultipart

@Transactional
class SESService {

    @Autowired
    ConfigService configService


    def sendEmail(String to, String subject, String body, Region region = Region.EU_WEST_2) {

        if (!configService.getProperty('domain')) {
            println(body)
        } else {
            String url = InternetDomainName.from(new URL(configService.getProperty('domain') as String).getHost()).topPrivateDomain().toString()
            String from = "Juralio <no-reply@${url}>"

            SendEmailRequest request = SendEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(to).build())
                    .message(Message.builder()
                            .body(Body.builder()
                                    .html(Content.builder().charset("UTF-8").data(body).build())
                                    .build())
                            .subject(Content.builder().charset("UTF-8").data(subject).build())
                            .build())
                    .source(from)
                    .build()

            SesClient client = SesClient.builder().region(region).build()
            try {
                client.sendEmail(request)
            } finally {
                client.close()
            }
            return
        }

    }

    def sendEmailWithFile(String to, String subject, String body, File file, Region region = Region.EU_WEST_2) {
        if (!configService.getProperty('domain')) {
            println(body)
        } else {
            String url = InternetDomainName.from(new URL(configService.getProperty('domain') as String).getHost()).topPrivateDomain().toString()
            String from = "Juralio <no-reply@${url}>"

            Session session = Session.getDefaultInstance(new Properties());
            MimeMessage mimeMessage = new MimeMessage(session);
            mimeMessage.setSubject(subject, "UTF-8");
            mimeMessage.setFrom(new InternetAddress(from));
            mimeMessage.setRecipients(jakarta.mail.Message.RecipientType.TO, InternetAddress.parse(to));

            MimeMultipart msgBody = new MimeMultipart("alternative");
            MimeBodyPart wrap = new MimeBodyPart();
            MimeBodyPart htmlPart = new MimeBodyPart();
            htmlPart.setContent(body, "text/html; charset=UTF-8");
            msgBody.addBodyPart(htmlPart);
            wrap.setContent(msgBody);

            MimeMultipart msg = new MimeMultipart("mixed");
            mimeMessage.setContent(msg);
            msg.addBodyPart(wrap);

            MimeBodyPart messageBodyPart = new MimeBodyPart();

            // Attachment pdf file
            DataSource source = new FileDataSource(file);
            messageBodyPart.setDataHandler(new DataHandler(source));
            messageBodyPart.setFileName(file.getName());

            msg.addBodyPart(messageBodyPart);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            mimeMessage.writeTo(outputStream);
            RawMessage rawMessage = RawMessage.builder().data(SdkBytes.fromByteArray(outputStream.toByteArray())).build()

            SendRawEmailRequest rawEmailRequest = SendRawEmailRequest.builder().rawMessage(rawMessage).build()
            SesClient client = SesClient.builder().region(region).build()
            try {
                client.sendRawEmail(rawEmailRequest);
            } finally {
                client.close()
            }

        }
    }

    def sendBccEmail(List<String> to, String subject, String body, Region region = Region.EU_WEST_2) {

        if (!configService.getProperty('domain')) {
            println(body)
        } else {
            String url = InternetDomainName.from(new URL(configService.getProperty('domain') as String).getHost()).topPrivateDomain().toString()
            String from = "Juralio <no-reply@${url}>"

            SendEmailRequest request = SendEmailRequest.builder()
                    .destination(Destination.builder().bccAddresses(to).build())
                    .message(Message.builder()
                            .body(Body.builder()
                                    .html(Content.builder().charset("UTF-8").data(body).build())
                                    .build())
                            .subject(Content.builder().charset("UTF-8").data(subject).build())
                            .build())
                    .source(from)
                    .build()

            SesClient client = SesClient.builder().region(region).build()
            try {
                client.sendEmail(request)
            } finally {
                client.close()
            }
            return
        }

    }


}
