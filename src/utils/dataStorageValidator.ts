class DataStorageValidator {
  async validateAllSections(buildingId?: string): Promise<DataStorageReport> {
    console.log('🔍 Starting comprehensive data storage validation...');

    const sections = [
      await this.validateFinancesSection(buildingId),
      await this.validateDocumentsSection(buildingId),
      await this.validateVotingSection(buildingId),
      await this.validateRTMFormationSection(buildingId)
    ];