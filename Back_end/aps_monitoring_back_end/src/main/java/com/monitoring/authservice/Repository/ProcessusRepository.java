package com.monitoring.authservice.Repository;

import com.monitoring.authservice.model.ActRuExecution;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface ProcessusRepository extends ReactiveCrudRepository<ActRuExecution, String> {
}
