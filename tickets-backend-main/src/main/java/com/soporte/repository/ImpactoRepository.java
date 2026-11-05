package com.soporte.repository;

import com.soporte.entity.Impacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImpactoRepository extends JpaRepository<Impacto, Long> {
    List<Impacto> findByActivoTrueOrderByValorAsc();
}
