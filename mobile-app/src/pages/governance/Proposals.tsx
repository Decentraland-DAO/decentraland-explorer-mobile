import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonModal, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { GovernanceService } from '../../services/GovernanceService';
import { Proposal } from '../../api/governance/Proposal';
import ProposalList from '../../components/governance/ProposalList';
import { ProfileService } from '../../services/ProfileService';
import { filter, swapVertical } from 'ionicons/icons';
import ProposalFilterModal, { FilterData } from '../../components/governance/ProposalFilterModal';
import ProposalSortByModal from '../../components/governance/ProposalSortByModal';
import './DAO.css';

const Proposals: React.FC = () => {
  const contentEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [showSortBy, setShowSortBy] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState<FilterData>();
  const [sortBy, setSortBy] = useState("desc");

  const [proposals, setProposals] = useState<Array<Proposal>>([]);

  const governanceService = new GovernanceService();

  const profileService = new ProfileService();

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "DAO",
        screen_class: "DAO",
      },
    });
  }, []);

  useEffect(() => {
    // prepare filter data
    const filterDataConfig = sessionStorage.getItem("proposal-filter");
    let category = "";
    let status = "";
    if (filterDataConfig) {
      const filterData = JSON.parse(filterDataConfig);
      category = filterData.category;
      status = filterData.status;
    }
    handleFilterApplied({
      category: category,
      status: status
    });
  }, []);

  useEffect(() => {
    if (filterData) {
      handleFilterApplied(filterData);
    }
  }, [sortBy]);

  const getProposals = async (offset: number, filter: FilterData) => {
    if (offset === 0) {
      setLoading(true);
    }
    try {
      const data = await governanceService.getProposals(25, offset, filter.status, filter.category, sortBy);
      await getProposalProfiles(data);
      console.log(offset);
      if (offset === 0) {
        setProposals(data);
      }
      else {
        setProposals([...proposals, ...data]);
      }
    }
    finally {
      setLoading(false);
    }
  }

  const getProposalProfiles = async (proposals: Array<Proposal>) => {
    const profileIds = proposals.map(p => {
      return p.user;
    });
    const userProfiles = await profileService.getProfileInfos(profileIds);
    for (const proposal of proposals) {
      proposal.userProfile = userProfiles?.find(p => p.avatars[0].ethAddress.toLowerCase() === proposal.user.toLowerCase());
    }
  }
  const getNextPage = async (e: any) => {
    await getProposals(skip + 25, filterData as FilterData);
    setSkip(skip + 25);
    e.target.complete();
  }

  const handleFilterApplied = (filter: FilterData) => {
    sessionStorage.setItem("proposal-filter", JSON.stringify({ category: filter.category, status: filter.status }));
    setShowFilter(false);
    setSkip(0);
    setFilterData(filter);
    setProposals([]);
    (contentEl.current as any).scrollToTop();
    getProposals(0, filter);
  }

  return (
    <IonPage className="dao">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Proposals</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={filter}></IonIcon>
            </IonButton>
            <IonButton onClick={() => setShowSortBy(true)}>
              <IonIcon icon={swapVertical}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentEl} fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Proposals</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading &&
          <div className="loading">
            <IonSpinner />
          </div>
        }
        {!loading &&
          <>
            <ProposalList proposals={proposals}></ProposalList>
            <IonInfiniteScroll
              onIonInfinite={getNextPage}
            >
              <IonInfiniteScrollContent
                loadingSpinner="bubbles"
                loadingText="Loading more data..."
              ></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </>
        }
      </IonContent>
      <IonModal className="filter-by"
        isOpen={showFilter}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowFilter(false)}
      >
        <ProposalFilterModal
          onDismiss={() => setShowFilter(false)}
          onApply={handleFilterApplied}
          value={filterData}
        ></ProposalFilterModal>
      </IonModal>
      <IonModal className="sort-by"
        isOpen={showSortBy}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowSortBy(false)}
      >
        <ProposalSortByModal
          onDismiss={() => setShowSortBy(false)}
          onApply={(val) => {
            setSortBy(val);
            setShowSortBy(false);
          }}
          value={sortBy}
        ></ProposalSortByModal>
      </IonModal>
    </IonPage >
  );
};

export default Proposals;
