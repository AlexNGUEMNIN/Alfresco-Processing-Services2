package com.monitoring.authservice.websocket;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.monitoring.authservice.Repository.MonitoringRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Component
public class ProcessWebSocketHandler implements WebSocketHandler {

    private final MonitoringRepository repository;
    private final ObjectMapper mapper;

    public ProcessWebSocketHandler(MonitoringRepository repository) {
        this.repository = repository;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.send(
                        Flux.interval(Duration.ofSeconds(5))
                                .flatMap(tick -> Flux.zip(
                                        repository.fetchLongRunningProcesses().collectList(),
                                        repository.fetchProcessesWithoutTasks().collectList(),
                                        repository.fetchInitiatorOnlyProcesses().collectList(),
                                        repository.countFailedProcessesWithExceptions()
                                ))
                                .map(tuple -> {
                                    Map<String, Object> response = new HashMap<>();

                                    response.put("processusLongs", Map.of(
                                            "nombre", tuple.getT1().size(),
                                            "processus", tuple.getT1()
                                    ));

                                    response.put("processusSansTâches", Map.of(
                                            "nombre", tuple.getT2().size(),
                                            "processus", tuple.getT2()
                                    ));

                                    response.put("processusInitiateurSeulement", Map.of(
                                            "nombre", tuple.getT3().size(),
                                            "processus", tuple.getT3()
                                    ));

                                    response.put("nombreProcessusÉchoués", tuple.getT4());

                                    return response;
                                })
                                .map(this::toJson)
                                .map(session::textMessage)
                                .doOnNext(json -> System.out.println("Sending data to client: " + json))
                                .doOnError(e -> System.err.println("WebSocket error: " + e.getMessage()))
                )
                .and(session.receive()
                        .doOnNext(message -> System.out.println("Received message: " + message.getPayloadAsText())))
                .doOnTerminate(() -> System.out.println("WebSocket terminated"));
    }

    private String toJson(Object data) {
        try {
            return mapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            System.err.println("JSON serialization error: " + e.getMessage());
            return "{\"error\":\"Serialization failed: " + e.getMessage() + "\"}";
        }
    }
}