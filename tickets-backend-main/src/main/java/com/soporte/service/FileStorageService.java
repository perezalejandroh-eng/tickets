package com.soporte.service;

import com.soporte.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.upload.max-size-mb}")
    private int maxSizeMb;

    @Value("${app.upload.allowed-types}")
    private String allowedTypes;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadPath));
            Files.createDirectories(Paths.get(uploadPath, "tickets"));
        } catch (IOException e) {
            log.error("No se pudo crear el directorio de uploads: {}", e.getMessage());
        }
    }

    public String guardarArchivo(MultipartFile file, String subdirectorio) {
        validarArchivo(file);

        String extension = obtenerExtension(file.getOriginalFilename());
        String nombreArchivo = UUID.randomUUID() + "." + extension;

        try {
            Path dirPath = Paths.get(uploadPath, subdirectorio);
            Files.createDirectories(dirPath);
            Path targetPath = dirPath.resolve(nombreArchivo);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return subdirectorio + "/" + nombreArchivo;
        } catch (IOException e) {
            throw new BusinessException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    public void eliminarArchivo(String rutaRelativa) {
        try {
            Path path = Paths.get(uploadPath, rutaRelativa);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.error("Error al eliminar archivo {}: {}", rutaRelativa, e.getMessage());
        }
    }

    public Path obtenerRutaCompleta(String rutaRelativa) {
        return Paths.get(uploadPath).resolve(rutaRelativa);
    }

    private void validarArchivo(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("El archivo está vacío");
        }
        long maxBytes = (long) maxSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new BusinessException("El archivo excede el tamaño máximo de " + maxSizeMb + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP");
        }
    }

    private String obtenerExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
