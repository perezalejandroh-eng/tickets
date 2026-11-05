package com.soporte.repository;

import com.soporte.entity.Prioridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrioridadRepository extends JpaRepository<Prioridad, Long> {
    List<Prioridad> findByActivoTrueOrderByNivelAsc();
    Optional<Prioridad> findByNivel(Integer nivel);
}
