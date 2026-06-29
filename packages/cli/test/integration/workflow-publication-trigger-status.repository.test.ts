import { createWorkflow, testDb } from '@n8n/backend-test-utils';
import {
	WorkflowPublicationOutboxRepository,
	WorkflowPublicationTriggerStatusRepository,
	WorkflowRepository,
} from '@n8n/db';
import { Container } from '@n8n/di';

describe('WorkflowPublicationTriggerStatusRepository', () => {
	let repo: WorkflowPublicationTriggerStatusRepository;
	let outboxRepo: WorkflowPublicationOutboxRepository;
	let workflowRepository: WorkflowRepository;

	beforeAll(async () => {
		await testDb.init();
		repo = Container.get(WorkflowPublicationTriggerStatusRepository);
		outboxRepo = Container.get(WorkflowPublicationOutboxRepository);
		workflowRepository = Container.get(WorkflowRepository);
	});
	afterEach(async () => {
		await testDb.truncate(['WorkflowEntity', 'SharedWorkflow', 'WorkflowPublicationOutbox']);
	});
	afterAll(async () => await testDb.terminate());

	it('replaceForWorkflow inserts rows then overwrites them', async () => {
		const wf = await createWorkflow();
		await repo.replaceForWorkflow(wf.id, [
			{ nodeId: 'n1', nodeName: 'A', versionId: 'v1', status: 'activated', errorMessage: null },
			{ nodeId: 'n2', nodeName: 'B', versionId: 'v1', status: 'failed', errorMessage: 'boom' },
		]);
		expect(await repo.findByWorkflowId(wf.id)).toHaveLength(2);

		await repo.replaceForWorkflow(wf.id, [
			{ nodeId: 'n1', nodeName: 'A', versionId: 'v2', status: 'activated', errorMessage: null },
		]);
		const rows = await repo.findByWorkflowId(wf.id);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ nodeId: 'n1', versionId: 'v2', status: 'activated' });
	});

	it('deleteForWorkflow clears rows', async () => {
		const wf = await createWorkflow();
		await repo.replaceForWorkflow(wf.id, [
			{ nodeId: 'n1', nodeName: 'A', versionId: 'v1', status: 'activated', errorMessage: null },
		]);
		await repo.deleteForWorkflow(wf.id);
		expect(await repo.findByWorkflowId(wf.id)).toHaveLength(0);
	});

	it('FK CASCADE deletes trigger status rows when parent workflow is deleted', async () => {
		const wf = await createWorkflow();
		await repo.replaceForWorkflow(wf.id, [
			{ nodeId: 'n1', nodeName: 'A', versionId: 'v1', status: 'activated', errorMessage: null },
			{ nodeId: 'n2', nodeName: 'B', versionId: 'v1', status: 'failed', errorMessage: 'boom' },
		]);
		expect(await repo.findByWorkflowId(wf.id)).toHaveLength(2);

		await workflowRepository.delete(wf.id);

		expect(await repo.findByWorkflowId(wf.id)).toEqual([]);
	});

	it('findLatestByWorkflowId returns the highest-id outbox record', async () => {
		const wf = await createWorkflow();
		// Insert two completed rows — completed has no partial-unique-index constraint,
		// so both rows can coexist for the same workflowId.
		const first = outboxRepo.create({
			workflowId: wf.id,
			publishedVersionId: 'v1',
			status: 'completed',
			errorMessage: null,
		});
		const second = outboxRepo.create({
			workflowId: wf.id,
			publishedVersionId: 'v2',
			status: 'completed',
			errorMessage: null,
		});
		await outboxRepo.save(first);
		await outboxRepo.save(second);

		const latest = await outboxRepo.findLatestByWorkflowId(wf.id);
		expect(latest).not.toBeNull();
		expect(latest!.id).toBe(second.id);
		expect(latest!.publishedVersionId).toBe('v2');
	});

	it('findLatestByWorkflowId returns null when no outbox records exist', async () => {
		const wf = await createWorkflow();
		const result = await outboxRepo.findLatestByWorkflowId(wf.id);
		expect(result).toBeNull();
	});
});
