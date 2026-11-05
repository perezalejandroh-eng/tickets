package com.soporte.repository;

import com.soporte.entity.TicketEvidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketEvidenciaRepository extends JpaRepository<TicketEvidencia, Long> {
    List<TicketEvidencia> findByTicketIdAndComentarioIsNull(Long ticketId);
    List<TicketEvidencia> findByTicketId(Long ticketId);
    List<TicketEvidencia> findByComentarioId(Long comentarioId);
}
