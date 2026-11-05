package com.soporte.repository;

import com.soporte.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
    boolean existsByCorreoAndIdNot(String correo, Long id);

    Optional<Usuario> findByTokenVerificacion(String token);

    Optional<Usuario> findByTokenRecuperacion(String token);

    @Query("SELECT u FROM Usuario u WHERE u.rol.nombre IN ('AGENTE', 'SUPERVISOR') AND u.activo = true")
    List<Usuario> findAgentesActivos();

    @Query("SELECT u FROM Usuario u WHERE u.rol.nombre = 'AGENTE' AND u.activo = true")
    List<Usuario> findSoloAgentes();
}
