package com.soporte.repository;

import com.soporte.entity.Notificacion;
import com.soporte.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    Page<Notificacion> findByUsuarioOrderByCreatedAtDesc(Usuario usuario, Pageable pageable);

    List<Notificacion> findByUsuarioAndLeidaFalseOrderByCreatedAtDesc(Usuario usuario);

    Long countByUsuarioAndLeidaFalse(Usuario usuario);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true, n.fechaLectura = CURRENT_TIMESTAMP WHERE n.usuario = :usuario AND n.leida = false")
    void marcarTodasLeidas(@Param("usuario") Usuario usuario);
}
