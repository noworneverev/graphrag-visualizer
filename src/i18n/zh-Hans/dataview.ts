const translation = {
    dataViewer:{
        "entities": "实体",
        "relationships": "关系",
        "documents": "文档",
        "textUnits": "文本单元",
        "communities": "社区",
        "communityReports": "社区报告",
        "covariates": "协变量",
      
        "entitiesTitle": "实体 (create_final_entities.parquet)",
        "relationshipsTitle": "关系 (create_final_relationships.parquet)",
        "documentsTitle": "文档 (create_final_documents.parquet)",
        "textUnitsTitle": "文本单元 (create_final_text_units.parquet)",
        "communitiesTitle": "社区 (create_final_communities.parquet)",
        "communityReportsTitle": "社区报告 (create_final_community_reports.parquet)",
        "covariatesTitle": "协变量 (create_final_covariates.parquet)",
      
    },
    detailDrawer: {
        "nodeDetails": "节点详情：{{name}}",
        "relationshipDetails":
          "(:{{sourceType}} {名称: '{{sourceName}}'})-[:{{relationshipType}}]->(:{{targetType}} {名称: '{{targetName}}'})",
        "nodeInformation": "节点信息",
        "relationshipInformation": "关系信息",
        "id": "ID",
        "name": "名称",
        "covariateType": "协变量类型",
        "type": "类型",
        "title": "标题",
        "summary": "摘要",
        "numberOfTokens": "令牌数量",
        "description": "描述",
        "humanReadableId": "可读 ID",
        "rawContent": "原始内容",
        "source": "源节点",
        "target": "目标节点",
        "weight": "权重",
        "sourceDegree": "源节点度数",
        "targetDegree": "目标节点度数",
        "rank": "排名",
        "linkedNodes": "关联节点",
        "linkedRelationships": "关联关系",
      }
}
  
  export default translation;