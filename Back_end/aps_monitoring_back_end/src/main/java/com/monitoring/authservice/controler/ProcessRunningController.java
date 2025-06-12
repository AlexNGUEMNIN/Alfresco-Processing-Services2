package com.monitoring.authservice.controler;

import com.monitoring.authservice.Repository.ProcessusRepository;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.Disposable;

@RestController
@RequestMapping("/process/running")
public class ProcessRunningController {

    public final ProcessusRepository processusRepository;
    private final DataSourceTransactionManagerAutoConfiguration dataSourceTransactionManagerAutoConfiguration;

    public ProcessRunningController(ProcessusRepository processusRepository, DataSourceTransactionManagerAutoConfiguration dataSourceTransactionManagerAutoConfiguration) {
        this.processusRepository = processusRepository;
        this.dataSourceTransactionManagerAutoConfiguration = dataSourceTransactionManagerAutoConfiguration;
    }

    @GetMapping("/all")
    public Disposable getAllActRuExecutions() {
        return processusRepository.findAll()
                .doOnNext(process -> System.out.println("processus "+process.getName()))
                .doOnComplete(() -> System.out.println("Process termine"))
                .subscribe();
    }

}
