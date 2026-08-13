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

import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.ObjectCannedACL
import software.amazon.awssdk.services.s3.model.PutObjectRequest

@Transactional
class S3Service {

    protected final Log logger = LogFactory.getLog(getClass())

    final static String JURALIO_DEFAULT_S3_BUCKET = "jur-default-s3-local-dev"
    final static String JURALIO_S3_BUCKET_ENV_VAR = "JURALIO_S3_BUCKET"
    final static String AWS_REGION_ENV_VAR = "AWS_SDK_REGION"
    final static Region DEFAULT_REGION = Region.EU_WEST_2

    String uploadFile(MultipartFile file, String partialPath, String fileName) {
        String path = "${partialPath}/${fileName}"
        logger.debug("uploadFile " + path + ", " + file)
        S3Client s3 = buildClient()
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(path)
                    .acl(ObjectCannedACL.PRIVATE)
                    .contentType(file.getContentType())
                    .build()
            s3.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()))
        } catch (Exception e) {
            // Preserve previous behaviour: swallow upload errors and signal failure with an empty url
            logger.warn("uploadFile failed for " + path, e)
            return ''
        } finally {
            s3.close()
        }
        String s3FileUrl = buildObjectUrl(getBucketName(), path)
        logger.debug("s3FileUrl " + s3FileUrl)
        return s3FileUrl
    }

    String uploadFile(File file, String partialPath, String fileName) {
        String path = "${partialPath}/${fileName}"
        logger.debug("uploadFile " + path + ", " + file)
        S3Client s3 = buildClient()
        try {
            PutObjectRequest.Builder builder = PutObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(path)
                    .acl(ObjectCannedACL.PRIVATE)
            String contentType = URLConnection.guessContentTypeFromName(fileName)
            if (contentType) {
                builder.contentType(contentType)
            }
            s3.putObject(builder.build(), RequestBody.fromFile(file))
        } catch (Exception e) {
            // Preserve previous behaviour: swallow upload errors and signal failure with an empty url
            logger.warn("uploadFile failed for " + path, e)
            return ''
        } finally {
            s3.close()
        }
        String s3FileUrl = buildObjectUrl(getBucketName(), path)
        logger.debug("s3FileUrl " + s3FileUrl)
        return s3FileUrl
    }

    File getFile(String path) {
        String filePath = "/tmp/${path}"
        File cachedFile = new File(filePath)
        // Save calls to s3 if we have the file already
        logger.debug("getFile " + filePath)
        if (cachedFile.exists()) {
            return cachedFile
        }
        cachedFile.getParentFile()?.mkdirs()
        S3Client s3 = buildClient()
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(path)
                    .build()
            s3.getObject(request, cachedFile.toPath())
        } finally {
            s3.close()
        }
        return cachedFile
    }

    boolean deleteFileByPath(String path) {
        S3Client s3 = buildClient()
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(path)
                    .build()
            s3.deleteObject(request)
        } catch (Exception e) {
            logger.error("deleteFileByPath failed for " + path, e)
            return false
        } finally {
            s3.close()
        }
        // Delete file off instance
        String filePath = "/tmp/${path}"
        def file = new File(filePath)
        file.delete()
        return true
    }

    String getBucketName() {
        String bucketName = System.getenv(JURALIO_S3_BUCKET_ENV_VAR)
        if (!bucketName) {
            bucketName = System.getProperty(JURALIO_S3_BUCKET_ENV_VAR)
        }
        if (!bucketName) {
            bucketName = JURALIO_DEFAULT_S3_BUCKET
        }
        logger.debug("getBucketName " + bucketName)
        return bucketName
    }

    private S3Client buildClient() {
        return S3Client.builder().region(resolveRegion()).build()
    }

    private Region resolveRegion() {
        String regionName = System.getenv(AWS_REGION_ENV_VAR) ?: System.getProperty(AWS_REGION_ENV_VAR)
        return regionName ? Region.of(regionName) : DEFAULT_REGION
    }

    private String buildObjectUrl(String bucket, String key) {
        // Mirrors the previous plugin's path-style URL (callers only rely on this being non-empty)
        Region region = resolveRegion()
        String host = region == Region.US_EAST_1 ? 's3' : "s3-${region.id()}"
        return "https://${host}.amazonaws.com/${bucket}/${key}"
    }
}
