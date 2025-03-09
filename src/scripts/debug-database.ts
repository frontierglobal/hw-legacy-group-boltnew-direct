import { mcpManager } from '../lib/mcp';
import { logger } from '../lib/logger';

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  relationships: RelationshipInfo[];
  policies: PolicyInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

interface RelationshipInfo {
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

interface PolicyInfo {
  name: string;
  operation: string;
  roles: string[];
  definition: string;
}

async function getTableInfo(tableName: string): Promise<TableInfo> {
  // In a real implementation, this would query the database schema
  // For now, we'll return mock data based on our migrations
  const tableInfo: TableInfo = {
    name: tableName,
    columns: [],
    relationships: [],
    policies: []
  };

  switch (tableName) {
    case 'roles':
      tableInfo.columns = [
        { name: 'id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ];
      tableInfo.policies = [
        {
          name: 'Roles are viewable by authenticated users',
          operation: 'SELECT',
          roles: ['authenticated'],
          definition: 'true'
        },
        {
          name: 'Roles are manageable by admins',
          operation: 'ALL',
          roles: ['authenticated'],
          definition: 'EXISTS (SELECT 1 FROM user_roles ur INNER JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name = \'admin\')'
        }
      ];
      break;

    case 'user_roles':
      tableInfo.columns = [
        { name: 'user_id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: true, isForeignKey: true, references: { table: 'auth.users', column: 'id' } },
        { name: 'role_id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: true, isForeignKey: true, references: { table: 'roles', column: 'id' } },
        { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ];
      tableInfo.relationships = [
        { type: 'many-to-one', targetTable: 'auth.users', sourceColumn: 'user_id', targetColumn: 'id' },
        { type: 'many-to-one', targetTable: 'roles', sourceColumn: 'role_id', targetColumn: 'id' }
      ];
      break;

    case 'properties':
      tableInfo.columns = [
        { name: 'id', type: 'uuid', isNullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'title', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'description', type: 'text', isNullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'location', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'price', type: 'numeric', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'roi', type: 'numeric', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'image_url', type: 'text', isNullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'type', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'text', isNullable: false, defaultValue: 'draft', isPrimaryKey: false, isForeignKey: false },
        { name: 'available_units', type: 'integer', isNullable: false, defaultValue: '1', isPrimaryKey: false, isForeignKey: false },
        { name: 'total_units', type: 'integer', isNullable: false, defaultValue: '1', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ];
      tableInfo.policies = [
        {
          name: 'Anyone can read published properties',
          operation: 'SELECT',
          roles: ['public'],
          definition: 'status = \'published\''
        },
        {
          name: 'Admins can manage properties',
          operation: 'ALL',
          roles: ['authenticated'],
          definition: 'EXISTS (SELECT 1 FROM user_roles ur INNER JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name = \'admin\')'
        }
      ];
      break;

    case 'investments':
      tableInfo.columns = [
        { name: 'id', type: 'uuid', isNullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'user_id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: { table: 'auth.users', column: 'id' } },
        { name: 'amount', type: 'numeric', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'type', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'target_id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'start_date', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'end_date', type: 'timestamptz', isNullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'interest_rate', type: 'numeric', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'text', isNullable: false, defaultValue: 'pending', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ];
      tableInfo.relationships = [
        { type: 'many-to-one', targetTable: 'auth.users', sourceColumn: 'user_id', targetColumn: 'id' }
      ];
      break;

    case 'documents':
      tableInfo.columns = [
        { name: 'id', type: 'uuid', isNullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'user_id', type: 'uuid', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: { table: 'auth.users', column: 'id' } },
        { name: 'investment_id', type: 'uuid', isNullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: { table: 'investments', column: 'id' } },
        { name: 'name', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'type', type: 'text', isNullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'text', isNullable: false, defaultValue: 'pending', isPrimaryKey: false, isForeignKey: false },
        { name: 'file_url', type: 'text', isNullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ];
      tableInfo.relationships = [
        { type: 'many-to-one', targetTable: 'auth.users', sourceColumn: 'user_id', targetColumn: 'id' },
        { type: 'many-to-one', targetTable: 'investments', sourceColumn: 'investment_id', targetColumn: 'id' }
      ];
      break;
  }

  return tableInfo;
}

async function main() {
  try {
    logger.info('Starting database analysis...');
    const tables = await mcpManager.listTables('supabase');
    
    console.log('\nDatabase Analysis');
    console.log('================\n');

    for (const tableName of tables) {
      const tableInfo = await getTableInfo(tableName);
      
      console.log(`Table: ${tableName}`);
      console.log('Columns:');
      tableInfo.columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})${col.isPrimaryKey ? ' [PK]' : ''}${col.isForeignKey ? ' [FK]' : ''}${col.isNullable ? ' [NULL]' : ' [NOT NULL]'}`);
        if (col.references) {
          console.log(`    References: ${col.references.table}.${col.references.column}`);
        }
      });

      if (tableInfo.relationships.length > 0) {
        console.log('\nRelationships:');
        tableInfo.relationships.forEach(rel => {
          console.log(`  - ${rel.type}: ${tableName}.${rel.sourceColumn} -> ${rel.targetTable}.${rel.targetColumn}`);
        });
      }

      if (tableInfo.policies.length > 0) {
        console.log('\nPolicies:');
        tableInfo.policies.forEach(policy => {
          console.log(`  - ${policy.name}`);
          console.log(`    Operation: ${policy.operation}`);
          console.log(`    Roles: ${policy.roles.join(', ')}`);
          console.log(`    Definition: ${policy.definition}`);
        });
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }

  } catch (error) {
    logger.error('Failed to analyze database:', error as Error);
    process.exit(1);
  } finally {
    await mcpManager.disconnectAll();
  }
}

main(); 