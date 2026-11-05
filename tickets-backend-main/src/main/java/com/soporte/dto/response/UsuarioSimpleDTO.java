package com.soporte.dto.response;

import com.soporte.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioSimpleDTO {

    private Long id;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String rol;

    public static UsuarioSimpleDTO from(Usuario u) {
        return UsuarioSimpleDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellidoPaterno(u.getApellidoPaterno())
                .apellidoMaterno(u.getApellidoMaterno())
                .correo(u.getCorreo())
                .rol(u.getRol() != null ? u.getRol().getNombre() : null)
                .build();
    }
}
