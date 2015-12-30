package org.graylog.plugins.messageprocessor.db;

import com.google.common.collect.Sets;
import com.mongodb.MongoException;
import org.graylog.plugins.messageprocessor.rest.ProcessingRule;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.NotFoundException;
import org.mongojack.DBCursor;
import org.mongojack.JacksonDBCollection;
import org.mongojack.WriteResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.Collection;
import java.util.Collections;

public class RuleSourceService {
    private static final Logger log = LoggerFactory.getLogger(RuleSourceService.class);

    public static final String COLLECTION = "message_processor_rules";

    private final JacksonDBCollection<ProcessingRule, String> dbCollection;

    @Inject
    public RuleSourceService(MongoConnection mongoConnection, MongoJackObjectMapperProvider mapper) {
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION),
                ProcessingRule.class,
                String.class,
                mapper.get());
    }

    public ProcessingRule save(ProcessingRule rule) {
        final WriteResult<ProcessingRule, String> save = dbCollection.save(rule);
        return rule.withId(save.getSavedId());
    }

    public ProcessingRule load(String id) throws NotFoundException {
        final ProcessingRule rule = dbCollection.findOneById(id);
        if (rule == null) {
            throw new NotFoundException("No rule with id " + id);
        }
        return rule;
    }

    public Collection<ProcessingRule> loadAll() {
        try {
            final DBCursor<ProcessingRule> processingRules = dbCollection.find();
            return Sets.newHashSet(processingRules.iterator());
        } catch (MongoException e) {
            log.error("Unable to load processing rules", e);
            return Collections.emptySet();
        }
    }
}
