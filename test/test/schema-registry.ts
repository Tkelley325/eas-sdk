import { SchemaRegistry } from '../../src/schema-registry';
import { getSchemaUUID } from '../../src/utils';
import Contracts from '../components/Contracts';
import { ZERO_ADDRESS, ZERO_BYTES } from '../utils/Constants';
import chai from './helpers/chai';
import { SchemaRegistry as SchemaRegistryContract } from '@ethereum-attestation-service/eas-contracts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

const { expect } = chai;

describe('SchemaRegistry API', () => {
  let accounts: SignerWithAddress[];
  let sender: SignerWithAddress;

  let schemaRegistryContract: SchemaRegistryContract;
  let schemaRegistry: SchemaRegistry;

  before(async () => {
    accounts = await ethers.getSigners();

    [sender] = accounts;
  });

  beforeEach(async () => {
    schemaRegistryContract = await Contracts.SchemaRegistry.deploy();

    schemaRegistry = new SchemaRegistry(schemaRegistryContract.address);
    schemaRegistry.connect(sender);
  });

  describe('construction', () => {
    it('should properly create an EAS API', async () => {
      expect(await schemaRegistry.getVersion()).to.equal(await schemaRegistryContract.VERSION());
    });
  });

  describe('registration', () => {
    const testRegister = async (schema: string, resolver: string | SignerWithAddress, revocable: boolean) => {
      const resolverAddress = typeof resolver === 'string' ? resolver : resolver.address;

      const uuid = getSchemaUUID(schema, resolverAddress, revocable);
      expect(schemaRegistry.getSchema({ uuid })).to.be.rejectedWith(new Error('Schema not found'));

      const tx = await schemaRegistry.register({ schema, resolverAddress, revocable });
      const uuid2 = await tx.wait();

      const schemaRecord = await schemaRegistry.getSchema({ uuid });
      expect(schemaRecord.uuid).to.equal(uuid);
      expect(schemaRecord.uuid).to.equal(uuid2);
      expect(schemaRecord.schema).to.equal(schema);
      expect(schemaRecord.revocable).to.equal(revocable);
      expect(schemaRecord.resolver).to.equal(resolverAddress);
    };

    it('should allow to register a schema', async () => {
      await testRegister('bytes32 proposalId, bool vote', accounts[3], true);
      await testRegister('bool hasPhoneNumber, bytes32 phoneHash', accounts[3], false);
    });

    it('should allow to register a schema without a schema', async () => {
      await testRegister(ZERO_BYTES, accounts[3], true);
    });

    it('should allow to register a schema without a resolver', async () => {
      await testRegister('bool isFriend', ZERO_ADDRESS, true);
    });

    it('should allow to register a schema without neither a schema or a resolver', async () => {
      await testRegister(ZERO_BYTES, ZERO_ADDRESS, true);
    });
  });
});
