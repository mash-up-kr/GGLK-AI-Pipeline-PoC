## 깔깔룩위원회 Node.js팀 AI PoC

### env

```
OPEN_AI_TOKEN="(key)"
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="(Langsmith API Key)"
LANGSMITH_PROJECT="GGLK-POC"
```

### 고려사항

1. 해당 모델이 요구사항에 적합한 성능을 지녔는가(특화되어있는 분야 확인하기)
2. 비용 (비용이 효율적인가)
3. 이미지 input비용을 효율적으로 가져가려면 어떻게 해야하는가
4. 효과적인 프롬프팅을 위한 시스템 프롬프트 작성하기
   1. 기본적으로 사용될 Base ChatMessages 실험해보기
   2. Halucination 방지를 위한 Selector 제공이 필요한가?
5. Langsmith연동해서 대략적인 토큰 사용량 확인

### Implementation

- [ ] OpenAI API 비용 연산식 적용
- [x] Function Calling 방식
- [x] Structed Output 방식
- [ ] SSE 방식
- [ ] Streaming 방식
