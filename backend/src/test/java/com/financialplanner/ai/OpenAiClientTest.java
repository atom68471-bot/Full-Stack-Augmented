package com.financialplanner.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.*;

class OpenAiClientTest {
    private OpenAiClient client;
    private ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        client = new OpenAiClient();
    }

    @Test
    void buildRequestBody_producesValidJson_evenWithNewlinesAndQuotes() throws Exception {
        String prompt = "Line1\nLine2\"quoted\" text";
        String json = client.buildRequestBody(prompt);

        // ensure it parses as JSON and contains the prompt exactly
        JsonNode root = mapper.readTree(json);
        assertThat(root.get("model").asText()).isEqualTo("gpt-3.5-turbo");
        assertThat(root.get("messages").isArray()).isTrue();
        String content = root.get("messages").get(0).get("content").asText();
        assertThat(content).isEqualTo(prompt);
        assertThat(root.get("max_tokens").asInt()).isEqualTo(200);
    }

    @Test
    void callOpenAiApi_sendsValidJsonToRestTemplate() throws Exception {
        // create a RestTemplate and attach a mock server
        RestTemplate rest = new RestTemplate();
        org.springframework.test.web.client.MockRestServiceServer server =
                org.springframework.test.web.client.MockRestServiceServer.bindTo(rest).build();

        client = new OpenAiClient(rest);
        // set fields via reflection since they're not exposed
        java.lang.reflect.Field keyField = OpenAiClient.class.getDeclaredField("apiKey");
        keyField.setAccessible(true);
        keyField.set(client, "dummy");
        java.lang.reflect.Field urlField = OpenAiClient.class.getDeclaredField("apiUrl");
        urlField.setAccessible(true);
        urlField.set(client, "https://example.com/v1");

        String samplePrompt = "Test prompt with \n newline";

        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo(
                        "https://example.com/v1/chat/completions"))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.method(HttpMethod.POST))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.header("Authorization", "Bearer dummy"))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.header("Content-Type", "application/json"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));

        // call the method which will hit the mock server
        client.callOpenAiApi(samplePrompt);

        server.verify();
    }
}
