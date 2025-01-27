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
package org.graylog.storage.elasticsearch7.testing;

import com.github.joschi.jadconfig.util.Duration;
import com.google.common.collect.ImmutableList;
import org.graylog.shaded.elasticsearch7.org.apache.http.impl.client.BasicCredentialsProvider;
import org.graylog.shaded.elasticsearch7.org.elasticsearch.client.RestHighLevelClient;
import org.graylog.storage.elasticsearch7.ElasticsearchClient;
import org.graylog.storage.elasticsearch7.RestHighLevelClientProvider;
import org.graylog.testing.containermatrix.SearchServer;
import org.graylog.testing.elasticsearch.Adapters;
import org.graylog.testing.elasticsearch.Client;
import org.graylog.testing.elasticsearch.FixtureImporter;
import org.graylog.testing.elasticsearch.TestableSearchServerInstance;
import org.graylog2.shared.bindings.providers.ObjectMapperProvider;
import org.graylog2.storage.SearchVersion;
import org.graylog2.system.shutdown.GracefulShutdownService;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.elasticsearch.ElasticsearchContainer;
import org.testcontainers.utility.DockerImageName;

import java.net.URI;
import java.util.List;

import static java.util.Objects.isNull;

public class ElasticsearchInstanceES7 extends TestableSearchServerInstance {
    private RestHighLevelClient restHighLevelClient;
    private ElasticsearchClient elasticsearchClient;
    private Client client;
    private FixtureImporter fixtureImporter;
    private Adapters adapters;
    private List<String> featureFlags;

    public ElasticsearchInstanceES7(final SearchVersion version, final String hostname, final Network network, final String heapSize, final List<String> featureFlags) {
        super(version, hostname, network, heapSize);
        this.featureFlags = featureFlags;
    }

    public ElasticsearchInstanceES7 init() {
        super.init();
        this.restHighLevelClient = buildRestClient();
        this.elasticsearchClient = new ElasticsearchClient(this.restHighLevelClient, false, new ObjectMapperProvider().get());
        this.client = new ClientES7(this.elasticsearchClient, featureFlags);
        this.fixtureImporter = new FixtureImporterES7(this.elasticsearchClient);
        this.adapters = new AdaptersES7(elasticsearchClient);
        Runtime.getRuntime().addShutdownHook(new Thread(this::close));
        return this;
    }

    public static ElasticsearchInstanceES7 create() {
        return Elasticsearch7InstanceBuilder.builder().build();
    }

    @Override
    protected String imageName() {
        return "docker.elastic.co/elasticsearch/elasticsearch-oss:" + version().version();
    }

    @Override
    public SearchServer searchServer() {
        return SearchServer.ES7;
    }

    private RestHighLevelClient buildRestClient() {
        return new RestHighLevelClientProvider(
                new GracefulShutdownService(),
                ImmutableList.of(URI.create("http://" + this.getHttpHostAddress())),
                Duration.seconds(60),
                Duration.seconds(60),
                Duration.seconds(60),
                1,
                1,
                1,
                false,
                false,
                null,
                Duration.seconds(60),
                "http",
                false,
                false,
                new BasicCredentialsProvider())
                .get();
    }

    @Override
    public Client client() {
        return this.client;
    }

    @Override
    public FixtureImporter fixtureImporter() {
        return this.fixtureImporter;
    }

    @Override
    public Adapters adapters() {
        return this.adapters;
    }

    @Override
    public String getLogs() {
        return this.container.getLogs();
    }

    public ElasticsearchClient elasticsearchClient() {
        return this.elasticsearchClient;
    }

    public RestHighLevelClient restHighLevelClient() {
        return this.restHighLevelClient;
    }

    @Override
    public GenericContainer<?> buildContainer(String image, Network network) {
        return new ElasticsearchContainer(DockerImageName.parse(image).asCompatibleSubstituteFor("docker.elastic.co/elasticsearch/elasticsearch"))
                // Avoids reuse warning on Jenkins (we don't want reuse in our CI environment)
                .withReuse(isNull(System.getenv("CI")))
                .withEnv("ES_JAVA_OPTS", getEsJavaOpts())
                .withEnv("discovery.type", "single-node")
                .withEnv("action.auto_create_index", "false")
                .withEnv("cluster.info.update.interval", "10s")
                .withEnv("cluster.routing.allocation.disk.threshold_enabled", "true")
                .withNetwork(network)
                .withNetworkAliases(hostname)
                .waitingFor(Wait.forHttp("/").forPort(OPENSEARCH_PORT));
    }
}
