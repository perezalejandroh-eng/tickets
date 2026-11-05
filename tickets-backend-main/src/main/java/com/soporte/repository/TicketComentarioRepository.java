package com.soporte.repository;

import com.soporte.entity.TicketComentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketComentarioRepository extends JpaRepository<TicketComentario, Long> {
    List<TicketComentario> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    List<TicketComentario> findByTicketIdAndEsInternoFalseOrderByCreatedAtAsc(Long ticketId);
}
