package com.soporte.repository;

import com.soporte.entity.Urgencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UrgenciaRepository extends JpaRepository<Urgencia, Long> {
    List<Urgencia> findByActivoTrueOrderByValorAsc();
}
