# Java runtime dependencies

- `ecj-4.6.1.jar`: unmodified Eclipse Java compiler 4.6.1 (Java 8).
  Source: https://repo.maven.apache.org/maven2/org/eclipse/jdt/core/compiler/ecj/4.6.1/
  Source archive: https://repo.maven.apache.org/maven2/org/eclipse/jdt/core/compiler/ecj/4.6.1/ecj-4.6.1-sources.jar
  Eclipse Public License 1.0; original notice is in `about-ecj.html` and inside the JAR.
- `LabSupport.java`: site's grading transport and supplied exercise helpers.
- CheerpJ 4.3 is loaded from https://cjrtnc.leaningtech.com/4.3/loader.js
  in a dedicated worker; the proprietary runtime is not redistributed here.
  Licensing: https://cheerpj.com/licensing/ (personal/FOSS community use;
  institutional classroom deployments should confirm educational eligibility).

Compilation and execution happen in the browser. Existing classroom answer
storage and the optional AI hint flow retain their existing server behavior.
Java uses separate class loaders per submission and deletes compiled files after
each run. Stop/time limits terminate the worker. First use downloads the runtime
and can take longer; subsequent runtime requests use the browser cache.
