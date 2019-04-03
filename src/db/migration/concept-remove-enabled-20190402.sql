SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital, modified by Nic Dobbins
-- Create date: 2018/8/2
-- Modify date: 2019/1/4 - Added Concept Specializations
-- Description: Hydrates a list of Concept Models by Ids
-- =======================================
ALTER PROCEDURE [app].[sp_HydrateConceptsByIds]
    @ids app.ResourceIdTable READONLY
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @specializedGroups app.ListTable

	-- Get specialization groups for
	-- the concepts to be retrieved
	INSERT INTO @specializedGroups (Id)
	SELECT sg.Id
	FROM app.SpecializationGroup sg
	WHERE EXISTS (SELECT 1 
				  FROM rela.ConceptSpecializationGroup csg
					   INNER JOIN app.Concept c
							ON csg.ConceptId = c.Id
				  WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
						AND c.SqlSetId = sg.SqlSetId
						AND c.IsSpecializable = 1)

	-- Return concepts
    SELECT
        c.Id,
        c.ParentId,
        c.RootId,
        c.ExternalId,
        c.ExternalParentId,
        c.UniversalId,
        c.IsNumeric,
        s.IsEventBased,
        c.IsParent,
        s.IsEncounterBased,
        c.IsPatientCountAutoCalculated,
        c.IsSpecializable,
        s.SqlSetFrom,
        c.SqlSetWhere,
        s.SqlFieldDate,
        c.SqlFieldNumeric,
        s.SqlFieldEventId,
        c.UiDisplayName,
        c.UiDisplayText,
		c.UiDisplaySubtext,
        c.UiDisplayUnits,
        c.UiDisplayTooltip,
        c.UiDisplayPatientCount,
        c.UiDisplayPatientCountByYear,
        c.UiNumericDefaultText
    FROM app.Concept c
		 INNER JOIN app.ConceptSqlSet s
			ON c.SqlSetId = s.Id
    WHERE EXISTS (SELECT 1 FROM @ids i WHERE c.Id = i.Id)
    ORDER BY c.UiDisplayRowOrder, c.UiDisplayName

	-- Return Specialization groups
	-- with ConceptId context
	SELECT csg.ConceptId
		 , sg.Id
		 , sg.UiDefaultText
		 , csg.OrderId
	FROM rela.ConceptSpecializationGroup csg
		 INNER JOIN app.SpecializationGroup sg
			ON csg.SpecializationGroupId = sg.Id
	WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = csg.ConceptId)
		  AND EXISTS (SELECT 1 FROM @specializedGroups sg WHERE sg.Id = sg.Id)

	-- Return Specializations
	SELECT s.Id
		 , s.SpecializationGroupId	
		 , s.UniversalId
		 , s.UiDisplayText
		 , s.SqlSetWhere
		 , s.OrderId
	FROM app.Specialization s
	WHERE EXISTS (SELECT 1 FROM @specializedGroups sg WHERE sg.Id = s.SpecializationGroupId)

END







GO


-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/9/14
-- Description: Gets roots and panel filters, in the first and second result set respecively.
-- =======================================
ALTER PROCEDURE [app].[sp_GetRootsPanelFilters]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    EXEC app.sp_GetRootConcepts @user, @groups, @admin = @admin;

    SELECT
        f.Id,
        f.ConceptId,
        ConceptUniversalId = c.UniversalId,
        f.IsInclusion,
        f.UiDisplayText,
        f.UiDisplayDescription
    FROM
        app.PanelFilter f
    JOIN app.Concept c on f.ConceptId = c.Id
    
END

ALTER TABLE app.Concept
DROP COLUMN IsEnabled

ALTER TABLE app.PanelFilter
DROP CONSTRAINT DF__PanelFilt__IsEna__06CD04F7

ALTER TABLE app.PanelFilter
DROP COLUMN IsEnabled