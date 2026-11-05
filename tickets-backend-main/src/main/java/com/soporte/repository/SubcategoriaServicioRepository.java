package com.soporte.repository;

import com.soporte.entity.SubcategoriaServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcategoriaServicioRepository extends JpaRepository<SubcategoriaServicio, Long> {
    List<SubcategoriaServicio> findByCategoriaServicioIdAndActivoTrue(Long categoriaId);
    List<SubcategoriaServicio> findByActivoTrue();
    List<SubcategoriaServicio> findAllByOrderByNombreAsc();
    List<SubcategoriaServicio> findByCategoriaServicioIdOrderByNombreAsc(Long categoriaId);
    boolean existsByNombreIgnoreCaseAndCategoriaServicioId(String nombre, Long categoriaId);
    boolean existsByNombreIgnoreCaseAndCategoriaServicioIdAndIdNot(String nombre, Long categoriaId, Long id);
}
