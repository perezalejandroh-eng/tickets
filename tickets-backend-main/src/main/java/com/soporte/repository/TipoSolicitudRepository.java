package com.soporte.repository;

import com.soporte.entity.TipoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoSolicitudRepository extends JpaRepository<TipoSolicitud, Long> {
    List<TipoSolicitud> findByActivoTrue();
    List<TipoSolicitud> findAllByOrderByNombreAsc();
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
