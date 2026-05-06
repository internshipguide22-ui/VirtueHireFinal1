package com.virtuehire.util;

import java.nio.file.Path;
import java.nio.file.Paths;

public final class StoragePathResolver {

    private StoragePathResolver() {
    }

    public static Path resolveUploadDir(String configuredPath) {
        Path rawPath = Paths.get(configuredPath);
        if (rawPath.isAbsolute()) {
            return rawPath.normalize();
        }

        Path userDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path candidate = userDir.resolve(rawPath).normalize();
        if (looksLikeBackendModuleDir(userDir) && !candidate.toFile().exists()) {
            return userDir.getParent().resolve(rawPath).normalize();
        }

        return candidate;
    }

    private static boolean looksLikeBackendModuleDir(Path dir) {
        Path fileName = dir.getFileName();
        return fileName != null && "Backend".equalsIgnoreCase(fileName.toString()) && dir.getParent() != null;
    }
}
