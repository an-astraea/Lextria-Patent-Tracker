
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Lock, Calendar, Hash, User, Building, Phone, Mail, AlertTriangle, CheckCircle, Fingerprint } from 'lucide-react';

interface PatentBasicInfoProps {
  patent: Patent;
}

const PatentBasicInfo: React.FC<PatentBasicInfoProps> = ({ patent }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Tracking ID:</span>
            </div>
            <p className="text-sm">{patent.tracking_id}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
              <span>Internal Tracking ID:</span>
            </div>
            <p className="text-sm">{patent.internal_tracking_id || patent.tracking_id}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Patent Applicant:</span>
            </div>
            <p className="text-sm">{patent.patent_applicant}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Client ID:</span>
            </div>
            <p className="text-sm">{patent.client_id}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>Application No:</span>
            </div>
            <p className="text-sm">
              {patent.application_no || 'Not assigned yet'}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Date of Filing:</span>
            </div>
            <p className="text-sm">
              {patent.date_of_filing 
                ? format(new Date(patent.date_of_filing), 'dd MMM yyyy')
                : 'Not filed yet'}
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-1">
            <div className="text-sm font-medium">Patent Title:</div>
            <p className="text-sm">{patent.patent_title}</p>
          </div>
          
          <div className="md:col-span-2 space-y-1">
            <div className="text-sm font-medium">Applicant Address:</div>
            <p className="text-sm whitespace-pre-line">{patent.applicant_addr}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>Inventor Phone:</span>
            </div>
            <p className="text-sm">{patent.inventor_ph_no}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium flex items-center gap-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Inventor Email:</span>
            </div>
            <p className="text-sm">{patent.inventor_email}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">IDF Status:</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={patent.idf_sent ? "success" : "outline"} className="flex items-center gap-1">
                {patent.idf_sent ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{patent.idf_sent ? "Sent" : "Not Sent"}</span>
              </Badge>
              <Badge variant={patent.idf_received ? "success" : "outline"} className="flex items-center gap-1">
                {patent.idf_received ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{patent.idf_received ? "Received" : "Not Received"}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">CS Data Status:</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={patent.cs_data ? "success" : "outline"} className="flex items-center gap-1">
                {patent.cs_data ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{patent.cs_data ? "CS Data Sent" : "CS Data Not Sent"}</span>
              </Badge>
              <Badge variant={patent.cs_data_received ? "success" : "outline"} className="flex items-center gap-1">
                {patent.cs_data_received ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{patent.cs_data_received ? "CS Data Received" : "CS Data Not Received"}</span>
              </Badge>
            </div>
          </div>
          
          {patent.created_at && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Created:</div>
              <p className="text-sm">{format(new Date(patent.created_at), 'dd MMM yyyy HH:mm')}</p>
            </div>
          )}
          
          {patent.updated_at && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Last Updated:</div>
              <p className="text-sm">{format(new Date(patent.updated_at), 'dd MMM yyyy HH:mm')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentBasicInfo;
