---
name: PESV quarterly report sequencing
description: Rules for adding the Superintendencia quarterly reports one at a time using existing modules.
---

Implement only the next report the user has described and approved. Treat the reports menu as a generator/connector, not as a place to create a separate data module for every requested evidence item. First inspect the source modules and reuse or enrich them. Before calling a report complete, map every explicit evidence item and relevant existing source dataset into the export, check that the signer is identified by the correct title and ID, and verify period semantics against available history fields. Keep the quarterly pattern: selected period, source completeness, exact PESV step/module for missing data, and standardized export. Never invent evidence or approval; require deliberate confirmation before using a stored signature. For lesson dissemination, use accident investigations as the source, Comunicaciones SST for distribution, and Portal de Empleados for read confirmation and recipient feedback; a read receipt alone is not feedback.

**Why:** The user wants one coherent report generator derived from existing modules, not duplicate data-entry modules, and will approve reports one at a time. The user also explicitly expects a proactive completeness audit and a finished implementation, not partial changes or questions about obvious source modules. Certifications have legal significance.

**How to apply:** Before each next report, wait for its source requirement, inspect all relevant existing modules, identify missing source data there, and implement only that report in the quarterly generator. Do not design future reports in advance. Explain missing fields with a direct link to the relevant PESV step; for signed outputs, use the company's configured representative, show their correct role and identification, and request explicit confirmation. Do not claim a report is complete based only on a successful build.
