'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import type { InteretValeur } from '@/utils';
import type { InteretCle } from '@/utils';
import {
  filterSouvenirsByEtiquettes,
  isEtiquetteAdminOnly,
} from '@/utils/filterSouvenirsByEtiquettes';
import CarteSouvenir from './CarteSouvenir';

const CLE_TO_VALEUR: Record<InteretCle, InteretValeur> = {
  'intéressé': 'oui',
  'pas intéressé': 'non',
  'pas prononcé': null,
};

/** 0 = petit (plusieurs cartes par ligne), 100 = grand (1 carte par ligne) */
export type ZoomPercent = number;

const ZOOM_MIN_PX = 140;
const ZOOM_MAX_PX = 600;

type GalerieCartesProps = {
  souvenirs: string[];
  selectedFilterKeys?: Set<InteretCle>;
  selectedEtiquetteLibelles?: Set<string>;
  zoomPercent?: number;
  isAdmin?: boolean;
};

export default function GalerieCartes({
  souvenirs,
  selectedFilterKeys,
  selectedEtiquetteLibelles,
  zoomPercent = 50,
  isAdmin = false,
}: GalerieCartesProps) {
  const [interets, setInterets] = useState<Record<string, InteretValeur>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [selectedNoms, setSelectedNoms] = useState<Set<string>>(new Set());
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [etiquettes, setEtiquettes] = useState<{ id: number; libelle: string }[]>([]);
  const [etiquettesParSouvenir, setEtiquettesParSouvenir] = useState<Record<string, string[]>>({});
  const [modalEtiquetteOpen, setModalEtiquetteOpen] = useState(false);
  const [modalEtiquetteLibelle, setModalEtiquetteLibelle] = useState('');
  const [modalEtiquetteError, setModalEtiquetteError] = useState<string | null>(null);
  const [panachageEtiquetteId, setPanachageEtiquetteId] = useState<number | null>(null);
  const [modalRenameEtiquetteId, setModalRenameEtiquetteId] = useState<number | null>(null);
  const [modalRenameEtiquetteLibelle, setModalRenameEtiquetteLibelle] = useState('');
  const [modalRenameEtiquetteError, setModalRenameEtiquetteError] = useState<string | null>(null);
  const router = useRouter();

  const fetchInterets = useCallback(async () => {
    try {
      const res = await fetch('/api/interet');
      if (res.ok) {
        const data = (await res.json()) as Record<string, string | null>;
        const normalized: Record<string, InteretValeur> = {};
        for (const [k, v] of Object.entries(data)) {
          normalized[k] = v === 'oui' ? 'oui' : v === 'non' ? 'non' : null;
        }
        setInterets(normalized);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterets();
  }, [fetchInterets]);

  const fetchEtiquettes = useCallback(async () => {
    try {
      const res = await fetch('/api/etiquettes');
      if (res.ok) {
        const data = (await res.json()) as { id: number; libelle: string }[];
        setEtiquettes(data);
      }
    } catch (e) {
      console.error('[etiquettes] fetch failed:', e);
    }
  }, []);

  useEffect(() => {
    fetchEtiquettes();
  }, [fetchEtiquettes]);

  const allNoms = useMemo(
    () => souvenirs.map((f) => f.replace(/\.(webp|heic|jpe?g)$/i, '')),
    [souvenirs]
  );

  useEffect(() => {
    if (etiquettes.length === 0 || allNoms.length === 0) return;
    let cancelled = false;
    const nomsParam = allNoms.map(encodeURIComponent).join(',');
    const next: Record<string, string[]> = {};
    allNoms.forEach((nom) => {
      next[nom] = [];
    });
    Promise.all(
      etiquettes.map(async (e) => {
        const res = await fetch(
          `/api/etiquettes/${e.id}/souvenirs?noms=${nomsParam}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { souvenir_noms: string[] };
        (data.souvenir_noms ?? []).forEach((nom) => {
          if (next[nom]) next[nom].push(e.libelle);
        });
      })
    ).then(() => {
      if (!cancelled) setEtiquettesParSouvenir(next);
    });
    return () => {
      cancelled = true;
    };
  }, [etiquettes, allNoms]);

  const handleDelete = useCallback(
    async (nom: string) => {
      setPendingDelete(nom);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    const nom = pendingDelete;
    if (!nom) return;
    setPendingDelete(null);
    setPending((prev) => new Set(prev).add(nom));
    try {
      const filename = souvenirs.find((f) => f.replace(/\.(webp|heic|jpe?g)$/i, '') === nom) ?? `${nom}.webp`;
      const res = await fetch(`/api/souvenirs/${encodeURIComponent(filename)}/delete`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('[souvenirs] DELETE failed:', res.status, err);
      }
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(nom);
        return next;
      });
    }
  }, [pendingDelete, souvenirs, router]);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const openModalEtiquette = useCallback(() => {
    setModalEtiquetteOpen(true);
    setModalEtiquetteLibelle('');
    setModalEtiquetteError(null);
  }, []);

  const closeModalEtiquette = useCallback(() => {
    setModalEtiquetteOpen(false);
    setModalEtiquetteLibelle('');
    setModalEtiquetteError(null);
  }, []);

  const submitCreateEtiquette = useCallback(async () => {
    const libelle = modalEtiquetteLibelle.trim();
    if (!libelle) return;
    setModalEtiquetteError(null);
    try {
      const res = await fetch('/api/etiquettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libelle,
          souvenir_noms: [...selectedNoms],
        }),
      });
      if (res.ok) {
        closeModalEtiquette();
        setSelectedNoms(new Set());
        fetchEtiquettes();
      } else if (res.status === 409) {
        const data = (await res.json()) as { error?: string };
        setModalEtiquetteError(data.error ?? 'Une étiquette avec ce libellé existe déjà');
      } else {
        const data = (await res.json()) as { error?: string };
        setModalEtiquetteError(data.error ?? 'Erreur lors de la création');
      }
    } catch (e) {
      console.error('[etiquettes] POST create error:', e);
      setModalEtiquetteError('Erreur lors de la création');
    }
  }, [modalEtiquetteLibelle, selectedNoms, closeModalEtiquette, fetchEtiquettes]);

  const handleSelectionChange = useCallback(
    (nom: string, selected: boolean, shiftKey?: boolean) => {
      const index = allNoms.indexOf(nom);
      if (index < 0) return;

      if (shiftKey && anchorIndex !== null) {
        const start = Math.min(anchorIndex, index);
        const end = Math.max(anchorIndex, index);
        setSelectedNoms((prev) => {
          if (selected) {
            const next = new Set<string>();
            for (let i = start; i <= end; i++) {
              next.add(allNoms[i]);
            }
            return next;
          }
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            next.delete(allNoms[i]);
          }
          return next;
        });
        setAnchorIndex(index);
      } else {
        setAnchorIndex(index);
        setSelectedNoms((prev) => {
          const next = new Set(prev);
          if (selected) next.add(nom);
          else next.delete(nom);
          return next;
        });
      }
    },
    [allNoms, anchorIndex]
  );

  const handleClickEtiquette = useCallback(
    async (etiquetteId: number) => {
      const noms = [...selectedNoms];
      if (noms.length === 0) return;
      try {
        const nomsParam = noms.map(encodeURIComponent).join(',');
        const res = await fetch(
          `/api/etiquettes/${etiquetteId}/souvenirs?noms=${nomsParam}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { souvenir_noms: string[] };
        const avec = data.souvenir_noms ?? [];
        const countAvec = avec.length;
        if (countAvec === 0) {
          const assignRes = await fetch(`/api/etiquettes/${etiquetteId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ souvenir_noms: noms }),
          });
          if (assignRes.ok) {
            setSelectedNoms(new Set());
            fetchEtiquettes();
          }
        } else if (countAvec === noms.length) {
          const unassignRes = await fetch(`/api/etiquettes/${etiquetteId}/unassign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ souvenir_noms: noms }),
          });
          if (unassignRes.ok) {
            setSelectedNoms(new Set());
            fetchEtiquettes();
          }
        } else {
          setPanachageEtiquetteId(etiquetteId);
        }
      } catch (e) {
        console.error('[etiquettes] click etiquette error:', e);
      }
    },
    [selectedNoms, fetchEtiquettes]
  );

  const openModalRenameEtiquette = useCallback((id: number, libelle: string) => {
    setModalRenameEtiquetteId(id);
    setModalRenameEtiquetteLibelle(libelle);
    setModalRenameEtiquetteError(null);
  }, []);

  const closeModalRenameEtiquette = useCallback(() => {
    setModalRenameEtiquetteId(null);
    setModalRenameEtiquetteLibelle('');
    setModalRenameEtiquetteError(null);
  }, []);

  const submitRenameEtiquette = useCallback(async () => {
    const id = modalRenameEtiquetteId;
    if (id == null) return;
    const libelle = modalRenameEtiquetteLibelle.trim();
    const original = etiquettes.find((e) => e.id === id)?.libelle ?? '';
    if (libelle === original) return;
    setModalRenameEtiquetteError(null);
    try {
      const res = await fetch(`/api/etiquettes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libelle }),
      });
      if (res.ok) {
        closeModalRenameEtiquette();
        fetchEtiquettes();
      } else if (res.status === 409) {
        const data = (await res.json()) as { error?: string };
        setModalRenameEtiquetteError(data.error ?? 'Une étiquette avec ce libellé existe déjà');
      } else {
        const data = (await res.json()) as { error?: string };
        setModalRenameEtiquetteError(data.error ?? 'Erreur lors du renommage');
      }
    } catch (e) {
      console.error('[etiquettes] PATCH rename error:', e);
      setModalRenameEtiquetteError('Erreur lors du renommage');
    }
  }, [modalRenameEtiquetteId, modalRenameEtiquetteLibelle, etiquettes, closeModalRenameEtiquette, fetchEtiquettes]);

  const submitDeleteEtiquette = useCallback(async () => {
    const id = modalRenameEtiquetteId;
    if (id == null) return;
    setModalRenameEtiquetteError(null);
    try {
      const res = await fetch(`/api/etiquettes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        closeModalRenameEtiquette();
        fetchEtiquettes();
      } else {
        const data = (await res.json()) as { error?: string };
        setModalRenameEtiquetteError(data.error ?? 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('[etiquettes] DELETE error:', e);
      setModalRenameEtiquetteError('Erreur lors de la suppression');
    }
  }, [modalRenameEtiquetteId, closeModalRenameEtiquette, fetchEtiquettes]);

  const handlePanachageSupprimerTout = useCallback(async () => {
    const id = panachageEtiquetteId;
    if (id == null) return;
    setPanachageEtiquetteId(null);
    const noms = [...selectedNoms];
    const res = await fetch(`/api/etiquettes/${id}/unassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ souvenir_noms: noms }),
    });
    if (res.ok) {
      setSelectedNoms(new Set());
      fetchEtiquettes();
    }
  }, [panachageEtiquetteId, selectedNoms, fetchEtiquettes]);

  const handlePanachageAffecterTout = useCallback(async () => {
    const id = panachageEtiquetteId;
    if (id == null) return;
    setPanachageEtiquetteId(null);
    const noms = [...selectedNoms];
    const res = await fetch(`/api/etiquettes/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ souvenir_noms: noms }),
    });
    if (res.ok) {
      setSelectedNoms(new Set());
      fetchEtiquettes();
    }
  }, [panachageEtiquetteId, selectedNoms, fetchEtiquettes]);

  const handleInteretChange = useCallback(
    async (souvenirNom: string, interet: InteretValeur) => {
      setPending((prev) => new Set(prev).add(souvenirNom));
      try {
        const res = await fetch('/api/interet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ souvenir_nom: souvenirNom, interet }),
        });
        if (res.ok) {
          setInterets((prev) => ({ ...prev, [souvenirNom]: interet }));
        } else {
          const err = await res.json().catch(() => ({}));
          console.error('[interet] POST failed:', res.status, err);
        }
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(souvenirNom);
          return next;
        });
      }
    },
    []
  );

  const selectedValeurs = useMemo(
    () =>
      selectedFilterKeys && selectedFilterKeys.size > 0
        ? new Set(
            [...selectedFilterKeys].map((cle) => CLE_TO_VALEUR[cle])
          )
        : null,
    [selectedFilterKeys]
  );

  const visibleSouvenirs = useMemo(() => {
    let byInteret = souvenirs;
    if (selectedValeurs !== null) {
      byInteret = souvenirs.filter((filename) => {
        const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
        const interet: InteretValeur = interets[nom] ?? null;
        return selectedValeurs.has(interet);
      });
    }
    if (
      !selectedEtiquetteLibelles ||
      selectedEtiquetteLibelles.size !== 1
    ) {
      return byInteret;
    }
    const noms = byInteret.map((f) => f.replace(/\.(webp|heic|jpe?g)$/i, ''));
    const avecEtiquettes = noms.map((nom) => {
      const raw = etiquettesParSouvenir[nom] ?? [];
      const etiquettes =
        isAdmin ? raw : raw.filter((l) => !isEtiquetteAdminOnly(l));
      return { nom, etiquettes };
    });
    const filtered = filterSouvenirsByEtiquettes(
      avecEtiquettes,
      [...selectedEtiquetteLibelles]
    );
    const filteredNoms = new Set(filtered.map((s) => s.nom));
    return byInteret.filter((filename) => {
      const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
      return filteredNoms.has(nom);
    });
  }, [
    souvenirs,
    selectedValeurs,
    interets,
    selectedEtiquetteLibelles,
    etiquettesParSouvenir,
    isAdmin,
  ]);

  const itemSizePx = Math.round(
    ZOOM_MIN_PX + (zoomPercent / 100) * (ZOOM_MAX_PX - ZOOM_MIN_PX)
  );

  const zoneEtiquettesContent =
    isAdmin && selectedNoms.size > 0 ? (
      <div className="filtre-pills zone-etiquettes" data-testid="zone-etiquettes">
        <span className="filtre-pills-legend">Affecter étiquettes</span>
        <div className="filtre-pills-options" role="group" aria-label="Zone admin étiquettes">
          <button
            type="button"
            className="filtre-pills-option"
            onClick={openModalEtiquette}
          >
            Ajouter étiquette
          </button>
          <button
            type="button"
            className="filtre-pills-option"
            onClick={() => setSelectedNoms(new Set())}
            data-testid="bouton-tout-deselectionner"
          >
            Tout déselectionner
          </button>
          <div aria-label="Liste des étiquettes" className="zone-etiquettes-liste">
          {etiquettes.length === 0 ? (
            <span>Aucune étiquette</span>
          ) : (
            <ul>
              {etiquettes.map((e) => (
                <li key={e.id}>
                  <div className="etiquette-chip">
                    <button
                      type="button"
                      onClick={() => handleClickEtiquette(e.id)}
                      title="Affecter ou désaffecter aux souvenirs cochés"
                    >
                      {e.libelle}
                    </button>
                    <button
                      type="button"
                      className="etiquette-chip-rename"
                      onClick={() => openModalRenameEtiquette(e.id, e.libelle)}
                      title="Renommer l'étiquette"
                      aria-label={`Renommer ${e.libelle}`}
                      data-testid={`etiquette-renommer-${e.id}`}
                    >
                      ✎
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </div>
    ) : null;

  const anchor =
    typeof document !== 'undefined'
      ? document.getElementById('zone-etiquettes-anchor')
      : null;

  return (
    <>
    {anchor && zoneEtiquettesContent &&
      createPortal(zoneEtiquettesContent, anchor)}
    <div
      className="galerie-grid"
      style={{ '--galerie-item-size': `${itemSizePx}px` } as React.CSSProperties}
    >
      {visibleSouvenirs.map((filename) => {
        const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
        const interetValue: InteretValeur = interets[nom] ?? null;
        const dataInteret =
          interetValue === null ? 'null' : interetValue;
        return (
          <div
            key={filename}
            className="galerie-grid-item"
            data-interet={dataInteret}
          >
            <CarteSouvenir
              filename={filename}
              interet={interetValue}
              onInteretChange={handleInteretChange}
              disabled={loading || pending.has(nom)}
              isAdmin={isAdmin}
              onDelete={isAdmin ? () => handleDelete(nom) : undefined}
              selected={isAdmin ? selectedNoms.has(nom) : false}
              onSelectionChange={isAdmin ? handleSelectionChange : undefined}
              etiquettesSurCarte={
                isAdmin
                  ? (etiquettesParSouvenir[nom] ?? [])
                  : (etiquettesParSouvenir[nom] ?? []).filter(
                      (l) => !isEtiquetteAdminOnly(l)
                    )
              }
            />
          </div>
        );
      })}
    </div>
    {pendingDelete && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="modal-confirmation-suppression"
        data-testid="modal-confirmation-suppression"
      >
        <h2 id="confirm-delete-title">Confirmer la suppression ?</h2>
        <p>Le souvenir sera définitivement supprimé.</p>
        <div className="modal-confirmation-actions">
          <button
            type="button"
            onClick={confirmDelete}
            data-testid="modal-confirm-suppression"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={cancelDelete}
            data-testid="modal-annuler-suppression"
          >
            Annuler
          </button>
        </div>
      </div>
    )}
    {panachageEtiquetteId != null && (
      <div role="dialog" aria-modal="true" aria-labelledby="panachage-title">
        <h2 id="panachage-title">Cette étiquette est affectée à certains souvenirs seulement</h2>
        <div>
          <button type="button" onClick={handlePanachageSupprimerTout}>
            Supprimer sur tout
          </button>
          <button type="button" onClick={handlePanachageAffecterTout}>
            Affecter à tout
          </button>
          <button type="button" onClick={() => setPanachageEtiquetteId(null)}>
            Annuler
          </button>
        </div>
      </div>
    )}
    {modalRenameEtiquetteId != null && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-rename-etiquette-title"
        data-testid="modal-rename-etiquette"
      >
        <h2 id="modal-rename-etiquette-title">Renommer l&apos;étiquette</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitRenameEtiquette();
          }}
        >
          <label htmlFor="modal-rename-etiquette-libelle">Libellé</label>
          <input
            id="modal-rename-etiquette-libelle"
            type="text"
            value={modalRenameEtiquetteLibelle}
            onChange={(e) => setModalRenameEtiquetteLibelle(e.target.value)}
            autoComplete="off"
            aria-describedby={modalRenameEtiquetteError ? 'modal-rename-etiquette-error' : undefined}
          />
          {modalRenameEtiquetteError && (
            <p id="modal-rename-etiquette-error" role="alert">
              {modalRenameEtiquetteError}
            </p>
          )}
          <div>
            <button type="button" onClick={closeModalRenameEtiquette}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                modalRenameEtiquetteLibelle.trim() ===
                (etiquettes.find((e) => e.id === modalRenameEtiquetteId)?.libelle ?? '').trim()
              }
              data-testid="modal-rename-etiquette-modifier"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={submitDeleteEtiquette}
              data-testid="modal-rename-etiquette-supprimer"
              className="text-destructive"
            >
              Supprimer
            </button>
          </div>
        </form>
      </div>
    )}
    {modalEtiquetteOpen && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-etiquette-title"
        data-testid="modal-etiquette"
      >
        <h2 id="modal-etiquette-title">Nouvelle étiquette</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCreateEtiquette();
          }}
        >
          <label htmlFor="modal-etiquette-libelle">Libellé</label>
          <input
            id="modal-etiquette-libelle"
            type="text"
            value={modalEtiquetteLibelle}
            onChange={(e) => setModalEtiquetteLibelle(e.target.value)}
            autoComplete="off"
            aria-describedby={modalEtiquetteError ? 'modal-etiquette-error' : undefined}
          />
          {modalEtiquetteError && (
            <p id="modal-etiquette-error" role="alert">
              {modalEtiquetteError}
            </p>
          )}
          <div>
            <button type="button" onClick={closeModalEtiquette}>
              Annuler
            </button>
            <button type="submit">Créer</button>
          </div>
        </form>
      </div>
    )}
    </>
  );
}
