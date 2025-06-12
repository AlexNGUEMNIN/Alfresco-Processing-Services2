package com.monitoring.authservice.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.monitoring.authservice.Repository.MonitoringRepository;
import com.monitoring.authservice.dto.StatusCount;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class StatusWebSocketHandler implements WebSocketHandler {

    private final MonitoringRepository repository;
    private final ObjectMapper mapper;

    public StatusWebSocketHandler(MonitoringRepository repository) {
        this.repository = repository;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.send(
                        Flux.interval(Duration.ofSeconds(3))
                                .flatMap(tick -> repository.fetchProcessStatusCounts().collectList())
                                .zipWith(repository.getTotalProcessCount())
                                .map(tuple -> createStatusResponse(tuple.getT1(), tuple.getT2()))
                                .map(this::toJson)
                                .map(session::textMessage)
                )
                .and(session.receive()
                        .doOnNext(message -> System.out.println("Received: " + message.getPayloadAsText())));
    }

    private Map<String, Object> createStatusResponse(List<StatusCount> statusCounts, Long total) {
        Map<String, Long> counts = statusCounts.stream()
                .collect(Collectors.toMap(
                        StatusCount::getStatus,
                        StatusCount::getTotal
                ));

        counts.putIfAbsent("actif", 0L);
        counts.putIfAbsent("suspendu", 0L);
        counts.putIfAbsent("terminé", 0L);
        counts.putIfAbsent("autre", 0L);

        return Map.of(
                "timestamp", System.currentTimeMillis(),
                "totalProcesses", total,
                "statusCounts", counts,
                "statusDetails", statusCounts.stream()
                        .map(sc -> Map.of(
                                "status", sc.getStatus(),
                                "label", sc.getStatusLabel(),
                                "count", sc.getTotal(),
                                "percentage", total > 0 ? Math.round(sc.getTotal() * 100.0 / total) : 0
                        ))
                        .collect(Collectors.toList())
        );
    }

    private String toJson(Object data) {
        try {
            return mapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return "{\"error\":\"Serialization failed\"}";
        }
    }
}