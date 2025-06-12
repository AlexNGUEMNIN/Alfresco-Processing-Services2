package com.monitoring.authservice.Repository;

import com.monitoring.authservice.dto.ProcessInfo;
import com.monitoring.authservice.dto.StatusCount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Repository
public class MonitoringRepository {

    @Autowired
    private DatabaseClient databaseClient;

    // Récupère les processus en cours depuis plus d'un jour, bloqués sur la première tâche utilisateur
    public Flux<ProcessInfo> fetchLongRunningProcesses() {
        String sql = """
            SELECT 
                a.id_ AS process_instance_id, 
                a.proc_def_id_ AS process_definition_id, 
                a.start_time_ AS process_start_time,
                a.start_user_id_ AS process_initiator
            FROM act_hi_procinst a
            JOIN act_hi_taskinst t ON a.proc_inst_id_ = t.proc_inst_id_
            WHERE a.end_time_ IS NULL
            AND a.start_time_ <= NOW() - INTERVAL '1 days'
            GROUP BY a.id_, a.proc_def_id_, a.start_time_, a.start_user_id_
            HAVING COUNT(t.id_) = 1
            ORDER BY a.start_time_ ASC
        """;

        return databaseClient.sql(sql)
                .map(row -> new ProcessInfo(
                        row.get("process_instance_id", String.class),
                        row.get("process_definition_id", String.class),
                        row.get("process_start_time", LocalDateTime.class),
                        row.get("process_initiator", String.class)
                ))
                .all();
    }

    //  Compte les processus échoués avec une exception depuis plus de 30 jours
    public Mono<Long> countFailedProcessesWithExceptions() {
        String sql = """
            SELECT count(*) 
            FROM act_ru_job rj 
            JOIN act_hi_procinst ap ON ap.id_ = rj.process_instance_id_ 
            WHERE rj.exception_msg_ IS NOT NULL 
            AND ap.start_time_ <= NOW() - INTERVAL '30 days'
        """;

        return databaseClient.sql(sql)
                .map(row -> row.get(0, Long.class))
                .one();
    }

    // Récupère les processus qui ont démarré mais n'ont jamais atteint une tâche utilisateur
    public Flux<ProcessInfo> fetchProcessesWithoutTasks() {
        String sql = """
            SELECT 
                a.id_ AS process_instance_id, 
                a.proc_def_id_ AS process_definition_id, 
                a.start_time_ AS process_start_time,
                a.start_user_id_ AS process_initiator
            FROM act_hi_procinst a
            LEFT JOIN act_hi_taskinst at ON at.proc_inst_id_ = a.id_
            WHERE a.end_time_ IS NULL 
            AND at.id_ IS NULL
            AND a.start_time_ <= NOW() - INTERVAL '1 days'
        """;

        return databaseClient.sql(sql)
                .map(row -> new ProcessInfo(
                        row.get("process_instance_id", String.class),
                        row.get("process_definition_id", String.class),
                        row.get("process_start_time", LocalDateTime.class),
                        row.get("process_initiator", String.class)
                ))
                .all();
    }

    // Récupère les processus où seul l'initiateur a interagi depuis plus de 30 jours
    public Flux<ProcessInfo> fetchInitiatorOnlyProcesses() {
        String sql = """
            SELECT 
                a.id_ AS process_instance_id, 
                a.proc_def_id_ AS process_definition_id, 
                a.start_time_ AS process_start_time,
                a.start_user_id_ AS process_initiator
            FROM act_hi_procinst a
            WHERE a.end_time_ IS NULL
            AND a.start_time_ <= NOW() - INTERVAL '1 days'
            AND NOT EXISTS (
                SELECT 1 FROM act_hi_taskinst t 
                WHERE t.proc_inst_id_ = a.id_ 
                AND t.assignee_ <> a.start_user_id_
            )
        """;

        return databaseClient.sql(sql)
                .map(row -> new ProcessInfo(
                        row.get("process_instance_id", String.class),
                        row.get("process_definition_id", String.class),
                        row.get("process_start_time", LocalDateTime.class),
                        row.get("process_initiator", String.class)
                ))
                .all();
    }
    public Flux<StatusCount> fetchProcessStatusCounts() {
        String sql = """
        SELECT
            CASE
                WHEN p.end_time_ IS NULL AND e.suspension_state_ = 2 THEN 'suspendu'
                WHEN p.end_time_ IS NULL AND (e.suspension_state_ IS NULL OR e.suspension_state_ = 1) THEN 'actif'
                WHEN p.end_time_ IS NOT NULL THEN 'terminé'
                ELSE 'autre'
            END AS status,
            COUNT(*) AS total
        FROM act_hi_procinst p
        LEFT JOIN act_ru_execution e ON p.proc_inst_id_ = e.proc_inst_id_
        GROUP BY status
        ORDER BY total DESC
        """;

        return databaseClient.sql(sql)
                .map(row -> new StatusCount(
                        row.get("status", String.class),
                        row.get("total", Long.class)
                ))
                .all();
    }

    public Mono<Long> getTotalProcessCount() {
        return databaseClient.sql("SELECT COUNT(*) FROM act_hi_procinst")
                .map(row -> row.get(0, Long.class))
                .one();
    }
}