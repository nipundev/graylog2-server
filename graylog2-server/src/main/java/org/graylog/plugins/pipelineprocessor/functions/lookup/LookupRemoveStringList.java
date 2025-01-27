/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.pipelineprocessor.functions.lookup;

import org.graylog.plugins.pipelineprocessor.EvaluationContext;
import org.graylog.plugins.pipelineprocessor.ast.functions.AbstractFunction;
import org.graylog.plugins.pipelineprocessor.ast.functions.FunctionArgs;
import org.graylog.plugins.pipelineprocessor.ast.functions.FunctionDescriptor;
import org.graylog.plugins.pipelineprocessor.ast.functions.ParameterDescriptor;
import org.graylog.plugins.pipelineprocessor.rulebuilder.RuleBuilderFunctionGroup;
import org.graylog2.lookup.LookupTableService;

import javax.inject.Inject;
import java.util.List;

import static org.graylog.plugins.pipelineprocessor.ast.functions.ParameterDescriptor.object;
import static org.graylog.plugins.pipelineprocessor.ast.functions.ParameterDescriptor.string;

public class LookupRemoveStringList extends AbstractFunction<Object> {

    public static final String NAME = "lookup_remove_string_list";

    private final ParameterDescriptor<String, LookupTableService.Function> lookupTableParam;
    private final ParameterDescriptor<Object, Object> keyParam;
    @SuppressWarnings("rawtypes")
    private final ParameterDescriptor<List, List> valueParam;

    @Inject
    public LookupRemoveStringList(LookupTableService lookupTableService) {
        lookupTableParam = string("lookup_table", LookupTableService.Function.class)
                .description("The existing lookup table to use to remove entries from the given list")
                .transform(tableName -> lookupTableService.newBuilder().lookupTable(tableName).build())
                .build();
        keyParam = object("key")
                .description("The key to remove the entries in the lookup table")
                .build();
        valueParam = ParameterDescriptor.type("value", List.class)
                .description("The list value that should be removed from the lookup table")
                .build();
    }

    @Override
    public Object evaluate(FunctionArgs args, EvaluationContext context) {
        Object key = keyParam.required(args, context);
        if (key == null) {
            return null;
        }
        LookupTableService.Function table = lookupTableParam.required(args, context);
        if (table == null) {
            return null;
        }
        List<String> value = valueParam.required(args, context);
        if (value == null) {
            return null;
        }

        return table.removeStringList(key, value).stringListValue();
    }

    @Override
    public FunctionDescriptor<Object> descriptor() {
        return FunctionDescriptor.builder()
                .name(NAME)
                .description("Remove the entries of the given string list from the named lookup table. Returns the updated list on success, null on failure.")
                .params(lookupTableParam, keyParam, valueParam)
                .returnType(List.class)
                .ruleBuilderEnabled()
                .ruleBuilderName("Remove string list from lookup table")
                .ruleBuilderTitle("Remove entries of string list from '${lookup_table}' using key '${key}'")
                .ruleBuilderFunctionGroup(RuleBuilderFunctionGroup.LOOKUP)
                .build();
    }
}
