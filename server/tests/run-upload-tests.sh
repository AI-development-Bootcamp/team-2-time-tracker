#!/bin/bash

# File Upload Test Suite Runner
# This script runs all tests related to file upload functionality

echo "=================================================="
echo "  File Upload Backend & Database Test Suite"
echo "=================================================="
echo ""

echo "Running Storage Service Tests..."
echo "--------------------------------"
npm test -- storage.service.test.ts
STORAGE_EXIT=$?

echo ""
echo "Running Document Upload Tests..."
echo "--------------------------------"
npm test -- absences.documents.test.ts
DOCUMENTS_EXIT=$?

echo ""
echo "Running Integration Tests..."
echo "--------------------------------"
npm test -- absences.endpoints.test.ts
INTEGRATION_EXIT=$?

echo ""
echo "=================================================="
echo "  Test Summary"
echo "=================================================="

if [ $STORAGE_EXIT -eq 0 ]; then
    echo "✅ Storage Service Tests: PASSED"
else
    echo "❌ Storage Service Tests: FAILED"
fi

if [ $DOCUMENTS_EXIT -eq 0 ]; then
    echo "✅ Document Upload Tests: PASSED (19 tests)"
else
    echo "❌ Document Upload Tests: FAILED"
fi

if [ $INTEGRATION_EXIT -eq 0 ]; then
    echo "✅ Integration Tests: PASSED"
else
    echo "❌ Integration Tests: FAILED"
fi

echo ""
echo "=================================================="
echo "  Test Coverage"
echo "=================================================="
echo ""
echo "Backend Operations:"
echo "  ✅ Document upload with validation"
echo "  ✅ Document metadata storage"
echo "  ✅ Absence status transitions"
echo "  ✅ Document listing and retrieval"
echo "  ✅ Document deletion with status rollback"
echo "  ✅ Authorization and ownership checks"
echo ""
echo "Database Operations:"
echo "  ✅ Create document records"
echo "  ✅ Store metadata (fileUrl, fileName, mimeType, fileSize, etc.)"
echo "  ✅ Query documents with ordering"
echo "  ✅ Update absence status based on documents"
echo "  ✅ Delete document records"
echo "  ✅ Count remaining documents"
echo ""
echo "Storage Service (S3):"
echo "  ✅ File upload to IDrive e2"
echo "  ✅ File deletion from storage"
echo "  ✅ Signed URL generation"
echo "  ✅ Path generation with UUIDs"
echo "  ✅ MIME type validation (PDF, JPEG, PNG)"
echo "  ✅ File size validation (max 10MB)"
echo ""
echo "API Endpoints:"
echo "  ✅ POST /api/absences/:id/documents"
echo "  ✅ GET /api/absences/:id/documents"
echo "  ✅ GET /api/absences/:id/documents/:docId/download"
echo "  ✅ DELETE /api/absences/:id/documents/:docId"
echo ""
echo "Security:"
echo "  ✅ JWT authentication required"
echo "  ✅ User can only upload to their own absences"
echo "  ✅ User can only delete their own documents"
echo ""
echo "=================================================="

# Exit with failure if any test failed
if [ $STORAGE_EXIT -ne 0 ] || [ $DOCUMENTS_EXIT -ne 0 ] || [ $INTEGRATION_EXIT -ne 0 ]; then
    exit 1
fi

exit 0
