# Chapter 9 easy approximation replacement

Goal: replace 9-1's comparison exercise with actual list scheduling on exactly two identical machines, taught through the existing printer story.

Design: `two_machine_time(jobs)` maintains two accumulated times. Read nonnegative integer durations in input order, give each to the less loaded machine (left on ties), and return the larger final time. Empty input returns 0. Up to 1,000 jobs of at most 1,000,000 fit C `int`. 9-2 extends the same idea to a variable number of machines. The main story compares the 6-minute greedy schedule with the 5-minute optimum, then explains why exhaustive assignment becomes costly. Claims about the general guarantee are supported by the existing list-scheduling proof.

Preservation: new ID `F10-01-v2`; keep `F10-01` and its original contract in the archive. No student answer or score mutation. Add only the accepted versioned ID to existing database constraints and backend totals. Retain 15 active final tasks. Existing unrelated chapter 8 changes remain untouched.

Tasks:
- [x] Add a regression test for the new catalog, empty input, ties, order-sensitive cases, examples, C harness, and the preserved old contract. Observe failure.
- [x] Author matching statement, solutions, tests, frontend harness support, archive entry, backend ID and migration. Verify Python/C results against a separate oracle and exhaustive small inputs.
- [x] Replace obsolete 9-1 PPTX content with complete definition, need for approximation, sequential diagrams, Python then C explanations, examples, and natural speaker notes. Keep the existing chapter frame.
- [x] Render and inspect changed slides, verify final file, code coverage, all active practice contracts, and native tables.
- [ ] Deploy compatible backend first, then publish website/deck. Verify live problem text, runtime examples and downloadable file hashes. Preserve production student data.

Validation: browser Python and C workers each passed 11/11. The intentionally incorrect serial-sum answer passed only 3/11. Exhaustive enumeration of 5,461 small inputs confirmed correct greedy execution and the stronger two-machine 1.5 approximation bound. The lesson states the simpler valid 2 bound and retains the existing visual proof. No student records were created or changed.
