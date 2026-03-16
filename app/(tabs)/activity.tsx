import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '@/constants/theme';
import AIEmptyState from '@/components/shared/AIEmptyState';
import FloatingLogo from '@/components/shared/FloatingLogo';
import { LinksService } from '@/services/linksService';
import { DealsService } from '@/services/dealsService';
import { I2WEService } from '@/services/i2weService';
import { CoreDeal, CoreI2WE, CoreLink } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';

type LinkFilter = 'received' | 'given';

interface AISuggestionItem {
  id: string;
  title: string;
  summary: string;
  detail: string;
}

export default function Activity() {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [links, setLinks] = useState<CoreLink[]>([]);
  const [deals, setDeals] = useState<CoreDeal[]>([]);
  const [meetings, setMeetings] = useState<CoreI2WE[]>([]);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});

  const [linkFilter, setLinkFilter] = useState<LinkFilter>('received');
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>({});
  const [expandedMeetings, setExpandedMeetings] = useState<Record<string, boolean>>({});
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState({
    links: false,
    deals: false,
    meetings: false,
    suggestions: false,
  });

  useEffect(() => {
    const loadActivityData = async () => {
      setIsLoading(true);
      try {
        const [myLinks, myDeals, myMeetings] = await Promise.all([
          LinksService.getMyLinks().catch(() => []),
          DealsService.getMyDeals().catch(() => []),
          I2WEService.getMyMeetings().catch(() => []),
        ]);

        setLinks(myLinks);
        setDeals(myDeals);
        setMeetings(myMeetings);

        const meetingMemberIds = Array.from(
          new Set(
            myMeetings
              .flatMap((meeting) => [meeting.member_1_id, meeting.member_2_id])
              .filter(Boolean)
          )
        );

        const dealMemberIds = Array.from(
          new Set(
            myDeals
              .flatMap((deal) => [deal.from_member_id, deal.to_member_id, deal.creator_id])
              .filter(Boolean)
          )
        );

        const profileIdsToLoad = Array.from(new Set([...meetingMemberIds, ...dealMemberIds]));
        if (profileIdsToLoad.length > 0) {
          const combinedNameMap: Record<string, string> = {};

          // First try direct profile lookup (works for current user and when RLS allows).
          const { data: profileRows, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', profileIdsToLoad);

          if (!error && profileRows) {
            for (const row of profileRows) {
              if (row.id && row.full_name) {
                combinedNameMap[row.id] = row.full_name;
              }
            }
          }

          // Fallback to secure house-members RPC for IDs hidden by profile RLS.
          const unresolvedIds = profileIdsToLoad.filter((id) => !combinedNameMap[id]);
          if (unresolvedIds.length > 0) {
            const houses = await LinksService.getUserHouses().catch(() => []);
            for (const house of houses) {
              const members = await LinksService.getHouseMembers(house.id).catch(() => []);
              for (const member of members) {
                if (member.id && member.full_name) {
                  combinedNameMap[member.id] = member.full_name;
                }
              }
            }
          }

          setMemberNames(combinedNameMap);
        } else {
          setMemberNames({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityData();
  }, []);

  const filteredLinks = useMemo(() => {
    if (!userId) return links;

    if (linkFilter === 'received') {
      return links.filter((link) => link.to_user_id === userId);
    }

    return links.filter((link) => link.from_user_id === userId);
  }, [links, linkFilter, userId]);

  const aiSuggestions = useMemo<AISuggestionItem[]>(() => {
    const suggestions: AISuggestionItem[] = [];

    if (links.length > 0) {
      suggestions.push({
        id: 'ai-links-followup',
        title: 'Follow up on open links',
        summary: `${links.filter((link) => link.status === 'open').length} open links need action`,
        detail: `You currently have ${links.filter((link) => link.status === 'open').length} open link(s). Prioritize high-urgency links and close completed ones to keep your pipeline clean.`,
      });
    }

    if (deals.length > 0) {
      suggestions.push({
        id: 'ai-deal-progress',
        title: 'Review recent deals',
        summary: `${deals.length} total deal records found`,
        detail: `You have ${deals.length} deal(s) in activity. Update status for active deals and ensure completed deals are marked correctly for accurate reporting.`,
      });
    }

    if (meetings.length > 0) {
      suggestions.push({
        id: 'ai-meeting-prep',
        title: 'Prepare for upcoming meetings',
        summary: `${meetings.filter((meeting) => meeting.status === 'scheduled').length} scheduled meetings`,
        detail: `You have ${meetings.filter((meeting) => meeting.status === 'scheduled').length} scheduled meeting(s). Add notes in advance so next actions are clear after each meeting.`,
      });
    }

    return suggestions.slice(0, 5);
  }, [links, deals, meetings]);

  const toggleExpanded = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => {
    setter((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const formatTimestamp = (value: string) => {
    try {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    } catch {
      return value;
    }
  };

  const toggleSection = (section: 'links' | 'deals' | 'meetings' | 'suggestions') => {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  const getMemberName = (memberId: string) => {
    return memberNames[memberId] || 'Member';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <FloatingLogo size="medium" />
          <Text style={styles.header}>Activity</Text>
        </View>

        {isLoading ? (
          <AIEmptyState message="Loading your activity..." />
        ) : (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Links Detail</Text>
                <TouchableOpacity
                  style={styles.sectionToggleButton}
                  onPress={() => toggleSection('links')}>
                  <Text style={styles.sectionToggleText}>
                    {expandedSections.links ? 'Collapse' : 'Expand'}
                  </Text>
                </TouchableOpacity>
              </View>

              {expandedSections.links && (
                <>
                  <View style={styles.filterRow}>
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        linkFilter === 'received' && styles.filterButtonActive,
                      ]}
                      onPress={() => setLinkFilter('received')}>
                      <Text
                        style={[
                          styles.filterText,
                          linkFilter === 'received' && styles.filterTextActive,
                        ]}>
                        Received
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        linkFilter === 'given' && styles.filterButtonActive,
                      ]}
                      onPress={() => setLinkFilter('given')}>
                      <Text
                        style={[
                          styles.filterText,
                          linkFilter === 'given' && styles.filterTextActive,
                        ]}>
                        Given
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {filteredLinks.length === 0 ? (
                    <Text style={styles.emptyText}>No links found for this filter.</Text>
                  ) : (
                    filteredLinks.map((link) => (
                      <View key={link.id} style={styles.detailCard}>
                        <Text style={styles.itemTitle}>{link.title}</Text>
                        <Text style={styles.itemSubText}>{link.contact_name}</Text>
                        <Text style={styles.itemMeta}>{formatTimestamp(link.created_at)}</Text>

                        {expandedLinks[link.id] && (
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLine}>Status: {link.status}</Text>
                            <Text style={styles.detailLine}>Urgency: {link.urgency}/10</Text>
                            <Text style={styles.detailLine}>Phone: {link.contact_phone}</Text>
                            <Text style={styles.detailLine}>
                              Email: {link.contact_email || 'Not provided'}
                            </Text>
                            <Text style={styles.detailLine}>
                              Description: {link.description || 'No description'}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.viewMoreButton}
                          onPress={() => toggleExpanded(link.id, setExpandedLinks)}>
                          <Text style={styles.viewMoreText}>
                            {expandedLinks[link.id] ? 'View less' : 'View more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>New Deal Posted</Text>
                <TouchableOpacity
                  style={styles.sectionToggleButton}
                  onPress={() => toggleSection('deals')}>
                  <Text style={styles.sectionToggleText}>
                    {expandedSections.deals ? 'Collapse' : 'Expand'}
                  </Text>
                </TouchableOpacity>
              </View>

              {expandedSections.deals && (
                <>
                  {deals.length === 0 ? (
                    <Text style={styles.emptyText}>No deals available.</Text>
                  ) : (
                    deals.map((deal) => (
                      <View key={deal.id} style={styles.detailCard}>
                        <Text style={styles.itemTitle}>{deal.title}</Text>
                        <Text style={styles.itemSubText}>₹{deal.amount}</Text>
                        <Text style={styles.itemMeta}>{formatTimestamp(deal.created_at)}</Text>

                        {expandedDeals[deal.id] && (
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLine}>
                              From:{' '}
                              {deal.deal_type === 'wevysya_deal'
                                ? 'WeVysya'
                                : getMemberName(deal.from_member_id || '')}
                            </Text>
                            <Text style={styles.detailLine}>
                              To: {getMemberName(deal.to_member_id || deal.creator_id)}
                            </Text>
                            <Text style={styles.detailLine}>
                              Description: {deal.description || 'No description'}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.viewMoreButton}
                          onPress={() => toggleExpanded(deal.id, setExpandedDeals)}>
                          <Text style={styles.viewMoreText}>
                            {expandedDeals[deal.id] ? 'View less' : 'View more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
                <TouchableOpacity
                  style={styles.sectionToggleButton}
                  onPress={() => toggleSection('meetings')}>
                  <Text style={styles.sectionToggleText}>
                    {expandedSections.meetings ? 'Collapse' : 'Expand'}
                  </Text>
                </TouchableOpacity>
              </View>

              {expandedSections.meetings && (
                <>
                  {meetings.length === 0 ? (
                    <Text style={styles.emptyText}>No meetings available.</Text>
                  ) : (
                    meetings.map((meeting) => (
                      <View key={meeting.id} style={styles.detailCard}>
                        <Text style={styles.itemTitle}>Meeting</Text>
                        <Text style={styles.itemSubText}>
                          {new Date(meeting.meeting_date).toLocaleString()}
                        </Text>
                        <Text style={styles.itemMeta}>{formatTimestamp(meeting.created_at)}</Text>

                        {expandedMeetings[meeting.id] && (
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLine}>Status: {meeting.status}</Text>
                            <Text style={styles.detailLine}>
                              Member 1: {getMemberName(meeting.member_1_id)}
                            </Text>
                            <Text style={styles.detailLine}>
                              Member 2: {getMemberName(meeting.member_2_id)}
                            </Text>
                            <Text style={styles.detailLine}>Notes: {meeting.notes || 'No notes'}</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.viewMoreButton}
                          onPress={() => toggleExpanded(meeting.id, setExpandedMeetings)}>
                          <Text style={styles.viewMoreText}>
                            {expandedMeetings[meeting.id] ? 'View less' : 'View more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>AI Suggestion</Text>
                <TouchableOpacity
                  style={styles.sectionToggleButton}
                  onPress={() => toggleSection('suggestions')}>
                  <Text style={styles.sectionToggleText}>
                    {expandedSections.suggestions ? 'Collapse' : 'Expand'}
                  </Text>
                </TouchableOpacity>
              </View>

              {expandedSections.suggestions && (
                <>
                  {aiSuggestions.length === 0 ? (
                    <Text style={styles.emptyText}>No AI suggestions available.</Text>
                  ) : (
                    aiSuggestions.map((suggestion) => (
                      <View key={suggestion.id} style={styles.detailCard}>
                        <Text style={styles.itemTitle}>{suggestion.title}</Text>
                        <Text style={styles.itemSubText}>{suggestion.summary}</Text>

                        {expandedSuggestions[suggestion.id] && (
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLine}>{suggestion.detail}</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.viewMoreButton}
                          onPress={() => toggleExpanded(suggestion.id, setExpandedSuggestions)}>
                          <Text style={styles.viewMoreText}>
                            {expandedSuggestions[suggestion.id] ? 'View less' : 'View more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          </>
        )}

        {!isLoading &&
          filteredLinks.length === 0 &&
          deals.length === 0 &&
          meetings.length === 0 &&
          aiSuggestions.length === 0 && (
          <AIEmptyState message="Want me to suggest people you should connect with?" />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 160,
    paddingHorizontal: spacing.xl,
  },
  headerContainer: {
    marginBottom: spacing.xxl,
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 42,
    color: colors.text_primary,
    letterSpacing: -1,
    marginTop: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.bg_secondary,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border_secondary,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSize.lg,
    color: colors.text_primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionToggleButton: {
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  sectionToggleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    borderRadius: borderRadius.button,
    backgroundColor: colors.bg_primary,
    borderWidth: 1,
    borderColor: colors.border_primary,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.accent_green_bright,
    borderColor: colors.accent_green_bright,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  filterTextActive: {
    color: colors.bg_primary,
  },
  detailCard: {
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border_secondary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.md,
    color: colors.text_primary,
  },
  itemSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    marginTop: spacing.xs,
  },
  itemMeta: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.xs,
    color: colors.text_muted,
    marginTop: spacing.xs,
  },
  detailContent: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailLine: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent_green_bright,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  viewMoreText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.sm,
    color: colors.bg_primary,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.sm,
    color: colors.text_muted,
  },
});
