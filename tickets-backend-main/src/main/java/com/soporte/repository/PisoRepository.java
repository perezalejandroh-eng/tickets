package com.soporte.repository;

import com.soporte.entity.Piso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PisoRepository extends JpaRepository<Piso, Long> {
    List<Piso> findByEdificioIdAndActivoTrue(Long edificioId);
    List<Piso> findByActivoTrue();
}
