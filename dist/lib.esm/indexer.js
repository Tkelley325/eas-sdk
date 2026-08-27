import { __decorate, __metadata } from "tslib";
import { Indexer__factory } from '@ethereum-attestation-service/eas-contracts';
import { EAS } from './eas.js';
import { legacyVersion } from './legacy/version.js';
import { Base, RequireSigner, Transaction } from './transaction.js';
export class Indexer extends Base {
    delegated;
    eas;
    constructor(address, options) {
        const { signer } = options || {};
        super(new Indexer__factory(), address, signer);
    }
    // Connects the API to a specific signer
    connect(signer) {
        delete this.delegated;
        delete this.eas;
        super.connect(signer);
        return this;
    }
    // Returns the version of the contract
    async getVersion() {
        return (await legacyVersion(this.contract)) ?? this.contract.version();
    }
    // Returns the address of the EAS contract
    getEASAddress() {
        return this.contract.getEAS();
    }
    // Returns the EAS API
    async getEAS() {
        if (this.eas) {
            return this.eas;
        }
        return (this.eas = new EAS(await this.getEASAddress(), { signer: this.signer }));
    }
    // Indexes an existing attestation
    async indexAttestation({ uid }, overrides) {
        return new Transaction(await this.contract.indexAttestation.populateTransaction(uid, { ...overrides }), this.signer, async () => { });
    }
    // Indexes multiple existing attestations
    async indexAttestations({ uids }, overrides) {
        return new Transaction(await this.contract.indexAttestations.populateTransaction(uids, { ...overrides }), this.signer, async () => { });
    }
    isAttestationIndexed({ uid }, overrides) {
        return this.contract.isAttestationIndexed(uid, { ...overrides });
    }
    getReceivedAttestationUIDs({ recipient, schema, start, length, reverseOrder }, overrides) {
        return this.contract.getReceivedAttestationUIDs(recipient, schema, start, length, reverseOrder, { ...overrides });
    }
    getReceivedAttestationUIDCount({ recipient, schema }, overrides) {
        return this.contract.getReceivedAttestationUIDCount(recipient, schema, {
            ...overrides
        });
    }
    getSentAttestationUIDs({ attester, schema, start, length, reverseOrder }, overrides) {
        return this.contract.getSentAttestationUIDs(attester, schema, start, length, reverseOrder, { ...overrides });
    }
    getSentAttestationUIDCount({ attester, schema }, overrides) {
        return this.contract.getSentAttestationUIDCount(attester, schema, {
            ...overrides
        });
    }
    getSchemaAttesterRecipientAttestationUIDs({ schema, attester, recipient, start, length, reverseOrder }, overrides) {
        return this.contract.getSchemaAttesterRecipientAttestationUIDs(schema, attester, recipient, start, length, reverseOrder, {
            ...overrides
        });
    }
    getSchemaAttesterRecipientAttestationUIDCount({ schema, attester, recipient }, overrides) {
        return this.contract.getSchemaAttesterRecipientAttestationUIDCount(schema, attester, recipient, {
            ...overrides
        });
    }
    getSchemaAttestationUIDs({ schema, start, length, reverseOrder }, overrides) {
        return this.contract.getSchemaAttestationUIDs(schema, start, length, reverseOrder, {
            ...overrides
        });
    }
    getSchemaAttestationUIDCount({ schema }, overrides) {
        return this.contract.getSchemaAttestationUIDCount(schema, {
            ...overrides
        });
    }
}
__decorate([
    RequireSigner,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Indexer.prototype, "indexAttestation", null);
__decorate([
    RequireSigner,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Indexer.prototype, "indexAttestations", null);
//# sourceMappingURL=indexer.js.map